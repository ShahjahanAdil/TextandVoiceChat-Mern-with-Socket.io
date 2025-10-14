const express = require("express");
const router = express.Router();

const authModel = require("../models/auth");

router.get("/all", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 20
        const skip = (page - 1) * limit

        const users = await authModel.find({ role: "chatter" }).sort({ createdAt: -1 }).skip(skip).limit(limit)
        const totalUsers = await authModel.countDocuments({ role: "chatter" })

        res.status(200).json({ message: 'Users fetched', users, totalUsers })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message })
    }
});

router.get("/search", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const searchText = req.query.searchText
        const limit = 20
        const skip = (page - 1) * limit

        const query = {
            $and: [
                { role: "chatter" },
                {
                    $or: [
                        { username: { $regex: searchText, $options: "i" } },
                        { email: { $regex: searchText, $options: "i" } }
                    ]
                }
            ]
        }

        const searchedUsers = await authModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
        const totalSearchedUsers = await authModel.countDocuments(query)

        res.status(200).json({ message: 'Users searched', searchedUsers, totalSearchedUsers })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message })
    }
});

router.put("/update-status/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const updatedUser = await authModel.findByIdAndUpdate(id, { status }, { new: true });

        res.status(202).json({ message: "User status updated successfully", updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await authModel.findByIdAndDelete(id);

        res.status(203).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;