const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Adjust limit if needed

// Endpoint to handle the check-in
app.post('/checkin', (req, res) => {
    const { image } = req.body; // Get the image data from the request

    // Spawn a child process to run the Python script
    const pythonProcess = spawn('python', ['local_classifier.py']);

    // Send image data to the Python script via stdin
    pythonProcess.stdin.write(image);
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Classification output: ${data}`);
        res.json({ message: 'Image processed', output: data.toString() }); // Respond back with output
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error in classification: ${data}`);
        res.status(500).json({ error: data.toString() }); // Send error response if any
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
