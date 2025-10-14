const mongoose = require('mongoose');
const { Schema } = mongoose;

const withdrawSchema = new Schema({
    chatterID: { type: Schema.Types.ObjectId, ref: "auth", required: true },
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "rejected"], default: "pending" }
}, { timestamps: true });

const withdrawModel = mongoose.models.withdraw || mongoose.model('withdraw', withdrawSchema);
module.exports = withdrawModel;