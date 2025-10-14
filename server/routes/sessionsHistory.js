const express = require('express');
const router = express.Router();

const sessionModel = require('../models/session');

router.get('/fetch-sessions', async (req, res) => {
    try {
        const { id, role } = req.query;
        if (!id || !role) return res.status(400).json({ message: 'Missing id or role' });

        const filter = role === 'chatter' ? { chatterID: id } : { userID: id };
        const populateField = role === 'chatter' ? 'userID' : 'chatterID';

        const sessions = await sessionModel.find(filter).populate(populateField, "username age gender avatar").sort({ createdAt: -1 });

        res.json({ sessions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;