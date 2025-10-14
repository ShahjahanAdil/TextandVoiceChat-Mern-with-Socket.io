const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const upload = require("../middlewares/uploadAvatar");
const authModel = require("../models/auth");

require("dotenv").config();

const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
    region: process.env.DO_SPACES_REGION,
});

router.post("/upload-avatar", upload.single("avatar"), async (req, res) => {
    try {
        const { userID } = req.body;
        if (!userID) return res.status(400).json({ success: false, message: "User ID is required" });
        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

        const fileName = `${uuidv4()}${path.extname(req.file.originalname)}`;

        const params = {
            Bucket: process.env.DO_SPACE_NAME,
            Key: `avatars/${fileName}`,
            Body: req.file.buffer,
            ACL: "public-read",
            ContentType: req.file.mimetype,
        };

        const uploaded = await s3.upload(params).promise();

        const avatarUrl = uploaded.Location.replace(
            process.env.DO_SPACES_ENDPOINT,
            process.env.DO_CDN_ENDPOINT
        );

        const user = await authModel.findByIdAndUpdate(userID, { avatar: avatarUrl }, { new: true });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: "Avatar uploaded successfully", avatar: avatarUrl, });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ success: false, message: "Upload failed", error: err.message });
    }
});

router.put("/update-profile", async (req, res) => {
    try {
        const { userID, username, email, phoneNumber, age, gender, plans } = req.body;

        if (!userID) return res.status(400).json({ success: false, message: "User ID is required" });

        if (email) {
            const existingUser = await authModel.findOne({ email });
            if (existingUser && existingUser._id.toString() !== userID) {
                return res.status(400).json({ success: false, message: "Email already exists. Please use another email.", });
            }
        }

        const user = await authModel.findById(userID);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (username) user.username = username;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (age) user.age = age;
        if (gender) user.gender = gender;

        if (user.role === "chatter" && Array.isArray(plans) && plans.length > 0) {
            user.plans = user.plans.map((existingPlan) => {
                const newPlan = plans.find(
                    (p) => p.title.toLowerCase() === existingPlan.title.toLowerCase()
                );
                if (newPlan && newPlan.price !== undefined) {
                    existingPlan.price = newPlan.price;
                }
                return existingPlan;
            });
        }

        await user.save();

        res.json({ success: true, message: "Profile updated successfully", user });
    } catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({ success: false, message: "Failed to update profile", error: err.message });
    }
});

module.exports = router;