Full-Stack Facial Recognition & Geolocation Check-In System
This is a full-stack web application that demonstrates a location-based check-in system using facial recognition. The application allows a user to "check in" from a browser; it captures their image and current geographic location, identifies the user via a machine learning model, and logs the event in a database.

Features
Real-time Facial Recognition: Identifies users from a live webcam feed.

Geolocation Tracking: Captures the user's precise latitude and longitude.

Address Reverse-Geocoding: Converts coordinates into a human-readable street address.

Persistent Storage: Logs all check-in events with user ID, location, and timestamp in an Oracle Database.

Full-Stack Integration: Demonstrates a cohesive system combining a web front-end, a Node.js back-end, and a Python machine learning service.

Tech Stack
Front-End:

HTML5

CSS3

Vanilla JavaScript

Webcam API

Geolocation API

Back-End:

Runtime: Node.js

Framework: Express.js

Database: Oracle Database

Dependencies: oracledb, cors, body-parser, dotenv

Machine Learning:

Language: Python

Core Libraries: PyTorch, Pillow (PIL), NumPy

Model: Pre-trained ResNet-50

System Architecture
The application operates with a decoupled architecture, ensuring a clear separation of concerns between the client, the server, and the machine learning model.

Client (Front-End): The user initiates a check-in from the Side Project.html page. The browser captures a video frame and the user's GPS coordinates.

API Server (Node.js): The front-end sends the image data (as base64) to the Node.js server (server.js).

Python ML Service: The Node.js server spawns a child_process to run the local_classifier.py script, passing the image data to it. The Python script loads the pre-trained ResNet-50 model, classifies the face, and returns the user's ID.

Database: Once the user ID is received from the Python script, the Node.js server connects to the Oracle Database and inserts a new record containing the user ID, location data, and a timestamp.
