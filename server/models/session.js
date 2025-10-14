const mongoose = require("mongoose");
const { Schema } = mongoose;

const sessionSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: "auth", required: true },
    chatterID: { type: Schema.Types.ObjectId, ref: "auth", required: true },
    plan: {
        title: String,
        price: Number,
        duration: Number,
        description: String,
    },
    transactionID: { type: String, required: true },
    transactionSS: { type: String, required: true },
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    amountPaid: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "rejected"], default: "pending" },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.models.session || mongoose.model("session", sessionSchema);