const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");

const sessionModel = require("../models/session");

router.get("/check", async (req, res) => {
    try {
        const { chatterID } = req.query;
        if (!chatterID) return res.status(400).json({ message: "chatterID is required" });

        const session = await sessionModel.findOne({ chatterID }).sort({ createdAt: -1 }).lean()

        if (!session) { return res.json({ message: "Chatter is available", isBusy: false }); }

        const now = dayjs();

        if (
            session.status === "completed" &&
            session.endTime &&
            now.isBefore(dayjs(session.endTime))
        ) {
            const remainingMinutes = dayjs(session.endTime).diff(now, "minute");

            return res.json({
                isBusy: true,
                message: `Chatter is busy right now. You can buy plan after ${remainingMinutes} minutes.`,
                remainingMinutes,
                endTime: session.endTime
            });
        }

        return res.json({ isBusy: false, message: "Chatter is available", });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;