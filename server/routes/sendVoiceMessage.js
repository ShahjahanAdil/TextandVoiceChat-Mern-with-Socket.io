const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const messageModel = require('../models/message');

require('dotenv').config();

const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
    region: process.env.DO_SPACES_REGION,
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

router.post('/send', upload.single('voice'), async (req, res) => {
    try {
        const { sessionID, senderID, receiverID, duration } = req.body;
        if (!sessionID || !senderID || !receiverID) {
            return res.status(400).json({ success: false, message: "Missing sessionID/senderID/receiverID" });
        }
        if (!req.file) return res.status(400).json({ success: false, message: 'No voice file uploaded' });
        if (!req.file || !req.file.mimetype.startsWith('audio/')) {
            return res.status(400).json({ success: false, message: 'Invalid file type' });
        }

        const ext = path.extname(req.file.originalname) || '.webm';
        const fileName = `${uuidv4()}${ext}`;
        const key = `voices/${fileName}`;

        const params = {
            Bucket: process.env.DO_SPACE_NAME,
            Key: key,
            Body: req.file.buffer,
            ACL: 'public-read',
            ContentType: req.file.mimetype
        };

        const uploaded = await s3.upload(params).promise();

        const voiceUrl = process.env.DO_CDN_ENDPOINT
            ? uploaded.Location.replace(process.env.DO_SPACES_ENDPOINT, process.env.DO_CDN_ENDPOINT)
            : uploaded.Location;

        const newMessage = await messageModel.create({
            sessionID,
            senderID,
            receiverID,
            voiceURL: voiceUrl,
            duration: duration ? Number(duration) : undefined,
            type: 'voice'
        });

        // Emit via socket.io (we will set io on app later in server.js)
        const io = req.app.get('io');
        if (io) {
            io.to(sessionID).emit('receiveMessage', newMessage);
        }

        res.json({ success: true, message: 'Voice uploaded', data: newMessage });
    } catch (err) {
        console.error('Voice upload error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;