const express = require('express');
const router = express.Router();
const dayjs = require("dayjs")

const authModel = require('../models/auth');
const sessionModel = require('../models/session');

router.get('/initial-fetch', async (req, res) => {
    try {
        const chatters = await authModel.find({ role: "chatter", status: "approved" }).sort({ createdAt: -1 }).limit(10)

        res.json({ users: chatters });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/fetch-sessions', async (req, res) => {
    try {
        const { userID } = req.query
        if (!userID) return res.status(400).json({ message: 'Missing userID' })

        const now = dayjs();

        const sessions = await sessionModel.find({
            userID, status: { $ne: "rejected" },
            $or: [
                { endTime: { $gt: now.toDate() } }, // active sessions
                { endTime: null } // still not started / pending activation
            ]
        })
            .populate("chatterID").sort({ createdAt: -1 })

        const uniqueChattersMap = new Map();
        for (const s of sessions) {
            const chatterId = s.chatterID?._id?.toString();
            if (chatterId && !uniqueChattersMap.has(chatterId)) {
                uniqueChattersMap.set(chatterId, s.chatterID);
            }
        }

        const uniqueChatters = Array.from(uniqueChattersMap.values());
        res.json({ sessions: uniqueChatters });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { searchText } = req.query;

        if (!searchText || searchText.trim() === "") {
            const chatters = await authModel.find({ role: "chatter", status: "approved" }).sort({ createdAt: -1 }).limit(10);
            return res.json({ chatters });
        }

        const searchRegex = new RegExp(searchText, "i");

        const chatters = await authModel.find({
            role: "chatter",
            status: "approved",
            $or: [
                { username: { $regex: searchRegex } },
                { email: { $regex: searchRegex } },
                { phoneNumber: { $regex: searchRegex } }
            ]
        }).sort({ createdAt: -1 });

        res.json({ users: chatters });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;