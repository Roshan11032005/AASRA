const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const app = express();

app.use(bodyParser.json());
app.use(cors()); 

// Connect to MongoDB database "DDinteraction" and collection "Sample_data"
const dbURI = 'mongodb://localhost:27017/DDinteraction';
mongoose.connect(dbURI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log('MongoDB connection error:', err));

// Location Schema and Model with GeoJSON format in "Sample_data" collection
const locationSchema = new mongoose.Schema({
    userId: { type: String, required: false },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true },
    },
    timestamp: { type: Date, default: Date.now }
});

locationSchema.index({ location: '2dsphere' }); // Geospatial index for the location field

// Use "Sample_data" collection for storing data
const Location = mongoose.model('Location', locationSchema, 'Sample_data');

// API to receive location data
app.post('/api/location', async (req, res) => {
    const { userId, latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    try {
        const newLocation = new Location({
            userId: userId || null, 
            location: {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        });
        
        await newLocation.save();
        res.status(201).json({ message: 'Location saved successfully' });
    } catch (error) {
        console.error('Error saving location:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API to find nearest users
app.post('/api/findNearestUser', async (req, res) => {
    const { latitude, longitude } = req.body;
    const radius = 5000; // Radius in meters
    
    try {
        const nearestUsers = await Location.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [longitude, latitude] },
                    $maxDistance: radius,
                },
            },
        }).limit(4); 

        res.json(nearestUsers);
    } catch (error) {
        console.error('Error finding nearest users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
