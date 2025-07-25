# Full-Stack Facial Recognition & Geolocation Check-In System

A comprehensive web application that demonstrates a location-based check-in system using facial recognition technology. Users can check in from their browser by capturing their image and current geographic location, with automatic user identification through machine learning and persistent logging in a database.

## 🚀 Features

- **Real-time Facial Recognition**: Identifies users from live webcam feed using pre-trained ResNet-50 model
- **Geolocation Tracking**: Captures precise latitude and longitude coordinates
- **Address Reverse-Geocoding**: Converts GPS coordinates into human-readable street addresses
- **Persistent Storage**: Logs all check-in events with user ID, location data, and timestamps
- **Full-Stack Integration**: Seamless integration between web frontend, Node.js backend, and Python ML service

Link to the Facial Recognition Model:https://drive.google.com/file/d/1C665jlWP7ll6q3A3ps5vVmtHSJrUF-1n/view?usp=sharing
## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Webcam API (MediaDevices)
- Geolocation API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Oracle Database
- **Dependencies**: 
  - `oracledb` - Oracle database connectivity
  - `cors` - Cross-origin resource sharing
  - `body-parser` - Request body parsing
  - `dotenv` - Environment variable management

### Machine Learning
- **Language**: Python
- **Libraries**: 
  - PyTorch - Deep learning framework
  - Pillow (PIL) - Image processing
  - NumPy - Numerical computations
- **Model**: Pre-trained ResNet-50 for facial recognition

## 🏗️ System Architecture

The application uses a decoupled architecture with clear separation of concerns:

```
[Browser Client] → [Node.js API Server] → [Python ML Service] → [Oracle Database]
```

### Data Flow
1. **Client Interaction**: User initiates check-in from the web interface
2. **Data Capture**: Browser captures webcam image and GPS coordinates
3. **API Request**: Frontend sends base64-encoded image data to Node.js server
4. **ML Processing**: Node.js spawns Python child process for facial recognition
5. **User Identification**: Python script processes image using ResNet-50 model
6. **Database Logging**: Server stores check-in record with user ID, location, and timestamp

