const express = require("express");
const router = express.Router();

const authModel = require("../models/auth");
const withdrawModel = require("../models/withdraw");

router.get("/all", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 20
        const skip = (page - 1) * limit

        const [withdrawRequests, totalWithdrawRequests] = await Promise.all([
            withdrawModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate("chatterID", "username email age gender avatar"),
            withdrawModel.countDocuments()
        ]);

        res.status(200).json({ success: true, withdrawRequests, totalWithdrawRequests })
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

        if (!searchText) {
            return res.status(400).json({ success: false, message: "Search text required" });
        }

        // Partial match on withdraw _id (string)
        const withdrawRequests = await withdrawModel.aggregate([
            {
                $addFields: {
                    stringId: { $toString: "$_id" }
                }
            },
            {
                $match: {
                    stringId: { $regex: searchText, $options: "i" }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);

        const totalSearchedWithdrawRequests = withdrawRequests.length;

        // Populate chatterID manually since aggregation loses refs
        const populated = await withdrawModel.populate(withdrawRequests, {
            path: "chatterID",
            select: "username email age gender avatar"
        });

        res.status(200).json({ success: true, withdrawRequests: populated, totalSearchedWithdrawRequests });
    } catch (error) {
        console.error("Search Withdraw Error:", error);
        res.status(500).json({ message: error.message });
    }
});

router.put("/update-status/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) return res.status(400).json({ message: "Status is required" });

        const withdraw = await withdrawModel.findById(id);
        if (!withdraw) return res.status(404).json({ message: "Withdraw not found" });

        withdraw.status = status;
        await withdraw.save();

        if (status === "completed") {
            const chatter = await authModel.findById(withdraw.chatterID);
            if (chatter) {
                chatter.pendingWithdraw -= withdraw.amount;
                chatter.totalWithdrawn += withdraw.amount;
                await chatter.save();
            }
        }

        res.status(202).json({ message: "User status updated successfully", updatedWithdraw: withdraw, });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await withdrawModel.findByIdAndDelete(id);

        if (!deleted) return res.status(404).json({ message: "Withdraw not found" });

        res.json({ message: "Withdraw deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router