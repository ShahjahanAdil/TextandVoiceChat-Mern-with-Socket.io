const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const upload = require("../middlewares/uploadAvatar");
const sessionModel = require("../models/session");

require("dotenv").config();

const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
    region: process.env.DO_SPACES_REGION,
});

router.post("/plan", upload.single("transactionSS"), async (req, res) => {
    try {
        const { userID, chatterID, plan, transactionID, bankName, accountName, accountNumber, amountPaid } = req.body;
        if (!userID || !chatterID) return res.status(400).json({ success: false, message: "User ID and Chatter ID is required" });
        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
        if (!transactionID, !bankName, !accountName, !accountNumber) return res.status(400).json({ success: false, message: "Some field is missing!" });

        const existing = await sessionModel.findOne({ userID, chatterID, status: "pending" });
        if (existing) {
            return res.status(400).json({ success: false, message: "A pending session already exists between you and the chatter." });
        }


        const fileName = `${uuidv4()}${path.extname(req.file.originalname)}`;

        const params = {
            Bucket: process.env.DO_SPACE_NAME,
            Key: `transactions/${fileName}`,
            Body: req.file.buffer,
            ACL: "public-read",
            ContentType: req.file.mimetype,
        };

        const uploaded = await s3.upload(params).promise();

        const screenshotUrl = uploaded.Location.replace(
            process.env.DO_SPACES_ENDPOINT,
            process.env.DO_CDN_ENDPOINT
        );

        await sessionModel.create({
            userID, chatterID, transactionID,
            transactionSS: screenshotUrl,
            plan: JSON.parse(plan),
            bankName, accountName, accountNumber, amountPaid
        })

        res.json({ success: true, message: "Request submitted. Admin will review it shortly." });
    } catch (err) {
        console.error("Purchase error:", err);
        res.status(500).json({ success: false, message: "Something went wrong. Please try again!", error: err.message });
    }
});

module.exports = router;