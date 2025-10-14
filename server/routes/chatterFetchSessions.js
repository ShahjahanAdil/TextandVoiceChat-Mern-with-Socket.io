const express = require('express');
const router = express.Router();
const dayjs = require("dayjs")

const sessionModel = require('../models/session');

router.get('/fetch-sessions', async (req, res) => {
    try {
        const { chatterID } = req.query
        if (!chatterID) return res.status(400).json({ message: 'Missing chatterID' })

        const now = dayjs();

        const sessions = await sessionModel.find({
            chatterID, status: { $ne: "rejected" },
            $or: [
                { endTime: { $gt: now.toDate() } }, // active sessions
                { endTime: null } // still not started / pending activation
            ]
        })
            .populate("userID").sort({ createdAt: -1 })

        const uniqueUsersMap = new Map();
        for (const s of sessions) {
            const userId = s.userID?._id?.toString();
            if (userId && !uniqueUsersMap.has(userId)) {
                uniqueUsersMap.set(userId, s.userID);
            }
        }

        const uniqueUsers = Array.from(uniqueUsersMap.values());
        res.json({ sessions: uniqueUsers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { searchText, chatterID } = req.query;
        if (!chatterID) return res.status(400).json({ message: 'Missing chatterID' });

        const now = dayjs();

        const sessions = await sessionModel.find({
            chatterID,
            status: { $ne: "rejected" },
            $or: [
                { endTime: { $gt: now.toDate() } },
                { endTime: null }
            ]
        }).populate("userID");

        let users = sessions.map(s => s.userID).filter(u => !!u);

        if (searchText && searchText.trim() !== "") {
            const searchRegex = new RegExp(searchText.trim(), "i");
            users = users.filter(u =>
                searchRegex.test(u.username) ||
                searchRegex.test(u.email) ||
                searchRegex.test(u.phoneNumber)
            );
        }

        res.json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;