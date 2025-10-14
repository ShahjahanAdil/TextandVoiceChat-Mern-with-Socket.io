const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
    sessionID: { type: Schema.Types.ObjectId, ref: "session", required: true },
    senderID: { type: Schema.Types.ObjectId, ref: "auth", required: true },
    receiverID: { type: Schema.Types.ObjectId, ref: "auth", required: true },
    message: { type: String },
    voiceURL: { type: String },
    type: { type: String, required: true },
    duration: { type: Number }, // For voice messages
    read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.message || mongoose.model("message", messageSchema);