const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const dayjs = require("dayjs")

const authModel = require("../models/auth");
const sessionModel = require("../models/session");

router.get("/all", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 20
        const skip = (page - 1) * limit

        const [sessions, totalSessions] = await Promise.all([
            sessionModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate("userID", "username email age gender avatar")
                .populate("chatterID", "username email age gender avatar"),
            sessionModel.countDocuments()
        ]);

        res.status(200).json({ success: true, sessions, totalSessions })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message })
    }
});

router.get("/search", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const searchText = req.query.searchText?.trim();
        const limit = 20;
        const skip = (page - 1) * limit;

        const matchedUsers = await authModel.find({
            $or: [
                { username: { $regex: searchText, $options: "i" } },
                { email: { $regex: searchText, $options: "i" } }
            ]
        }).select("_id");

        const userIDs = matchedUsers.map(u => u._id);

        const query = {
            $or: [
                { _id: mongoose.Types.ObjectId.isValid(searchText) ? searchText : null },
                { userID: { $in: userIDs } }
            ]
        };

        const [sessions, totalSearchedSessions] = await Promise.all([
            sessionModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate("userID", "username email age gender avatar")
                .populate("chatterID", "username email age gender avatar"),
            sessionModel.countDocuments(query)
        ]);

        res.status(200).json({ success: true, sessions, totalSearchedSessions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.put("/update-status/:id", async (req, res) => {
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
        const { id } = req.params;
        const { status, duration, price, chatterID } = req.body;

        if (!status) {
            await dbSession.abortTransaction();
            dbSession.endSession();
            return res.status(400).json({ message: "Status is required" });
        }

        if (status === "rejected") {
            await sessionModel.findByIdAndUpdate(id, { status }, { new: true, session: dbSession });
        } else if (status === "completed") {
            const now = dayjs();

            const updatingFields = {
                status,
                startTime: now.toDate(),
                endTime: now.add(duration, "minute").toDate()
            }

            await sessionModel.findByIdAndUpdate(id, updatingFields, { new: true, session: dbSession });
            await authModel.findByIdAndUpdate(chatterID, { $inc: { availableBalance: price } }, { new: true, session: dbSession });
        }

        await dbSession.commitTransaction();
        dbSession.endSession();

        res.status(202).json({ message: "Session status updated successfully" });
    } catch (error) {
        console.error("Transaction error:", error);
        await dbSession.abortTransaction();
        dbSession.endSession();
        res.status(500).json({ message: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await sessionModel.findByIdAndDelete(id);

        if (!deleted) return res.status(404).json({ message: "Session not found" });

        res.json({ message: "Session deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;