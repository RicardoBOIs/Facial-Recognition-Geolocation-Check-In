// server.js
require('dotenv').config();
const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');

// Create separate Express apps for different functionalities
const checkinApp = express();
const dbApp = express();

// Define separate ports
const CHECKIN_PORT = 3000;  // Port for check-in related endpoints
const DB_PORT = 3001;       // Port for database related endpoints

// Middleware for both apps
checkinApp.use(cors());
checkinApp.use(bodyParser.json({ limit: '50mb' }));
dbApp.use(cors());
dbApp.use(bodyParser.json());

// Oracle connection configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
};

// Initialize Oracle connection pool
async function initialize() {
    try {
        await oracledb.createPool({
            ...dbConfig,
            poolMin: 1,
            poolMax: 10,
            poolIncrement: 1
        });
        console.log('Database connection pool created');
    } catch (err) {
        console.error('Error initializing database connection pool:', err);
        throw err;
    }
}

// Execute SQL queries function
async function executeQuery(query, binds = [], opts = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(query, binds, {
            autoCommit: true,
            ...opts
        });
        return result;
    } catch (err) {
        console.error('Execute query error:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

checkinApp.post('/checkin', async (req, res) => {
    const { image } = req.body; // Only require the image for classification

    
    // Check for required fields
    if (!image) {
        return res.status(400).json({ error: 'Missing required field: image' });
    }

    try {
        const pythonProcess = spawn('python', ['local_classifier.py']);
        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error(`Python process exited with code ${code}`);
                return res.status(500).json({
                    error: 'Classification failed',
                    details: errorData
                });
            }

            try {
                // Parse the output from Python
                const outputJson = JSON.parse(outputData);
                const user_id = outputJson.label; // Assuming "label" key holds the user ID

                // If user_id is valid, return it to the client
                if (user_id) {
                    res.json({
                        message: 'Classification successful',
                        user_id: user_id // Return the user ID for further processing
                    });
                } else {
                    // If user_id is not valid, return an error
                    res.status(400).json({ error: 'Invalid user ID from classification' });
                }
            } catch (parseError) {
                console.error('Error parsing Python output:', parseError);
                res.status(500).json({
                    error: 'Failed to parse classification result',
                    details: parseError.message
                });
            }
        });

        // Send the image data to the Python process
        pythonProcess.stdin.write(image);
        pythonProcess.stdin.end();
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({
            error: 'Failed to process image',
            details: error.message
        });
    }
});



// Database related endpoint (Port 3001)
dbApp.post('/storeCheckin', async (req, res) => {
    const { user_id, latitude, longitude, address } = req.body;

    // Validate input
    if (!user_id || !latitude || !longitude || !address) {
        return res.status(400).json({
            error: 'Missing required fields'
        });
    }

    const query = `
        INSERT INTO checkins 
        (user_id, latitude, longitude, address, check_in_time) 
        VALUES 
        (:user_id, :latitude, :longitude, :address, CURRENT_TIMESTAMP)
    `;

    const binds = {
        user_id: user_id,  // user_id from classifier
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address,
    };

    try {
        const result = await executeQuery(query, binds);
        res.json({
            message: 'Check-in data stored successfully',
        });
    } catch (dbError) {
        console.error('Database error:', dbError);
        res.status(500).json({
            error: 'Failed to store check-in data',
            details: dbError.message
        });
    }
});

dbApp.get('/checkins', async (req, res) => {
    try {
        const query = `
            SELECT * FROM checkins 
            ORDER BY check_in_time DESC`;
        
        const result = await executeQuery(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching check-ins:', err);
        res.status(500).json({ 
            error: 'Failed to fetch check-ins',
            details: err.message 
        });
    }
});

// Graceful shutdown handling
async function shutdown(signal) {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    try {
        const pool = oracledb.getPool();
        if (pool) {
            await pool.close(10);
            console.log('Database pool closed');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
}

// Start both servers
async function startServers() {
    try {
        await initialize();
        
        // Start check-in server
        checkinApp.listen(CHECKIN_PORT, () => {
            console.log(`Check-in server running on http://localhost:${CHECKIN_PORT}`);
        });

        // Start database server
        dbApp.listen(DB_PORT, () => {
            console.log(`Database server running on http://localhost:${DB_PORT}`);
        });
    } catch (err) {
        console.error('Failed to start servers:', err);
        process.exit(1);
    }
}

// Register shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the servers
startServers();