const express = require("express");
const router = express.Router();

const messageModel = require("../models/message")

router.get("/fetch/:sessionID", async (req, res) => {
    try {
        const { sessionID } = req.params;

        const messages = await messageModel.find({ sessionID }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

module.exports = router