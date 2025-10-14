const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentMethodsSchema = new Schema({
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    receivingLimit: { type: String },
}, { timestamps: true });

const paymentMethodsModel = mongoose.models.paymentMethods || mongoose.model('paymentMethods', paymentMethodsSchema);
module.exports = paymentMethodsModel;