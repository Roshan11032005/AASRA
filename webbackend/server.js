const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5501;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MongoDB connections
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const client = new MongoClient(MONGO_URI);
const dbURI = 'mongodb://localhost:27017/locationsDB';

mongoose.connect(dbURI)
    .then(() => console.log('MongoDB connected with Mongoose...'))
    .catch(err => console.log('MongoDB connection error with Mongoose:', err));

client.connect()
    .then(() => {
        const db = client.db('DDinteraction');
        global.interactionCollection = db.collection('interaction_check');
        global.drugCollection = db.collection('Drugs');
        console.log('Connected to MongoDB with MongoClient...');
    })
    .catch(err => console.error('Error connecting to MongoDB with MongoClient:', err));

// Location Schema and Model (using Mongoose) with GeoJSON format
const locationSchema = new mongoose.Schema({
    userId: { type: String, required: false },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true },
    },
    timestamp: { type: Date, default: Date.now }
});

locationSchema.index({ location: '2dsphere' });
const Location = mongoose.model('Location', locationSchema);

// Endpoint to check pregnancy safety (using MongoDB Client)
app.get('/checkPregnancySafety/:drugName', async (req, res) => {
    try {
        const drug = await global.drugCollection.findOne({ "Drug Name": req.params.drugName });
        if (!drug) return res.status(404).json({ message: "Drug not found" });

        const isPregnancySafe = drug["Pregnancy Category"] !== "D" && drug["Pregnancy Category"] !== "X";
        res.json({
            drug_name: drug["Drug Name"],
            pregnancy_safe: isPregnancySafe,
            pregnancy_category: drug["Pregnancy Category"]
        });
    } catch (error) {
        console.error('Error checking pregnancy safety:', error);
        res.status(500).json({ message: "Error checking pregnancy safety" });
    }
});

// Route to check interactions between drugs (using MongoDB Client)
app.post('/check-interactions', async (req, res) => {
    const { drugs } = req.body;

    if (!drugs || drugs.length < 2) {
        return res.status(400).json({ message: "Please enter at least two drugs to check for interactions." });
    }

    const interactionsFound = [];
    try {
        for (let i = 0; i < drugs.length; i++) {
            for (let j = i + 1; j < drugs.length; j++) {
                const drug1 = drugs[i].trim();
                const drug2 = drugs[j].trim();

                const interaction = await global.interactionCollection.findOne({
                    $or: [
                        { "Drug 1": drug1, "Drug 2": drug2 },
                        { "Drug 1": drug2, "Drug 2": drug1 }
                    ]
                });

                if (interaction) {
                    interactionsFound.push({
                        "Drug 1": interaction["Drug 1"],
                        "Drug 2": interaction["Drug 2"],
                        "Interaction Description": interaction["Interaction Description"]
                    });
                }
            }
        }

        if (interactionsFound.length === 0) {
            return res.json({ message: "No interactions found between the selected drugs." });
        }
        return res.json(interactionsFound);

    } catch (error) {
        console.error("Error checking interactions:", error);
        return res.status(500).json({ message: "Error checking interactions. Please try again later." });
    }
});

// API to receive location data (using Mongoose)
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

// API to find nearest users (using Mongoose)
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
