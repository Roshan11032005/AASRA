const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection setup
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const client = new MongoClient(MONGO_URI);

let interactionCollection;

// Connect to MongoDB and set up collection
client.connect()
    .then(() => {
        const db = client.db('DDinteraction');
        interactionCollection = db.collection('Drugs'); // Ensure this matches your collection name
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });

// Endpoint to check pregnancy safety
app.get("/checkPregnancySafety/:drugName", async (req, res) => {
    try {
        // Correctly reference the collection to find the drug
        const drug = await interactionCollection.findOne({ "Drug Name": req.params.drugName }); // Use the correct field name
        if (!drug) return res.status(404).json({ message: "Drug not found" });

        // Check if the drug is safe during pregnancy
        const isPregnancySafe = drug["Pregnancy Category"] !== "D" && drug["Pregnancy Category"] !== "X"; // Adjust the field name
        res.json({
            drug_name: drug["Drug Name"], // Use the correct field name
            pregnancy_safe: isPregnancySafe,
            pregnancy_category: drug["Pregnancy Category"] // Use the correct field name
        });
    } catch (error) {
        console.error('Error checking pregnancy safety:', error);
        res.status(500).json({ message: "Error checking pregnancy safety" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
