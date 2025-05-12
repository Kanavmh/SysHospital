// routes/appointment.js
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDb } = require('../database/db');

router.post('/bookappointment', async (req, res) => {
    const db = getDb(); // Must be called here
    if (!db) {
        console.error("❌ DB not connected");
        return res.status(500).send("Database not connected");
    }

    const { patientId, doctorId, date, time } = req.body;

    if (!patientId || !doctorId || !date || !time) {
        return res.status(400).send("Missing required fields");
    }

    try {
        const result = await db.collection('appointments').insertOne({
            patientId: new ObjectId(patientId),
            doctorId: new ObjectId(doctorId),
            date,
            time,
        });

        console.log("✅ Inserted:", result.insertedId);
        res.send("Appointment Confirmed");
    } catch (err) {
        console.error("❌ Insert Error:", err);
        res.status(500).send("Error saving appointment");
    }
});

module.exports = router;
