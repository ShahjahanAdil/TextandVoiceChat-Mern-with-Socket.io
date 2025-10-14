const express = require("express");
const router = express.Router();

const authModel = require("../models/auth");
const withdrawModel = require("../models/withdraw");

router.get("/all", async (req, res) => {
    try {
        const { chatterID } = req.query
        const page = parseInt(req.query.page) || 1
        const limit = 20
        const skip = (page - 1) * limit

        const [withdraws, totalWithdraws] = await Promise.all([
            withdrawModel.find({ chatterID }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            withdrawModel.countDocuments({ chatterID })
        ]);

        res.status(200).json({ success: true, withdraws, totalWithdraws })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message })
    }
});

router.post("/create", async (req, res) => {
    try {
        const { chatterID } = req.query
        const newWithdraw = req.body

        const withdraw = await withdrawModel.create({ chatterID, ...newWithdraw })
        await authModel.findByIdAndUpdate(chatterID, {
            $inc: {
                availableBalance: -newWithdraw.amount,
                pendingWithdraw: newWithdraw.amount
            }
        });

        res.status(201).json({ success: true, withdraw })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message })
    }
});

module.exports = router;