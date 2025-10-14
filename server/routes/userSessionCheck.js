const express = require("express");
const router = express.Router();

const sessionModel = require("../models/session");

router.get("/check", async (req, res) => {
    try {
        const { userID, chatterID } = req.query;
        if (!userID || !chatterID) {
            return res.status(400).json({ message: "userID and chatterID are required" });
        }

        const session = await sessionModel.findOne({ userID, chatterID }).sort({ createdAt: -1 }).lean()

        if (!session) {
            return res.json({ status: "no-session", session: null });
        }

        return res.json({ status: session.status, session });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;