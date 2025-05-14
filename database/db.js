const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/medismin'; 
const client = new MongoClient(uri);

let db;

async function connectToDB() {
    try {
        await client.connect();
        db = client.db('medismin'); // Use your actual DB name here
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
    }
}

// Call it immediately
connectToDB();

module.exports = {
    getDb: () => db,
};
