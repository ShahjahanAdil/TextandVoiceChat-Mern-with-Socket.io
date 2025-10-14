const mongoose = require('mongoose');
const { Schema } = mongoose;

const authSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "chatter", "admin"], default: "user" },
    status: { type: String, enum: ["pending", "approved", "rejected", "banned"], default: "pending" },
    phoneNumber: { type: String, default: null },
    age: { type: Number, default: null },
    gender: { type: String, enum: ['male', 'female'], default: null },
    avatar: { type: String, default: null },
    online: { type: Boolean, default: false },
    plans: [{
        title: String,
        description: String,
        price: Number,
        duration: Number,
    }],
    availableBalance: { type: Number, default: 0 },
    pendingWithdraw: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
}, { timestamps: true });

const authModel = mongoose.models.auth || mongoose.model('auth', authSchema);
module.exports = authModel;