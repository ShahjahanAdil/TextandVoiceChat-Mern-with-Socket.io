const express = require('express');
const router = express.Router();

const paymentMethodsModel = require('../models/paymentMethod');

router.get('/all', async (req, res) => {
    try {
        const methods = await paymentMethodsModel.find().sort({ createdAt: -1 });
        res.json({ paymentMethods: methods });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/add', async (req, res) => {
    try {
        const { bankName, accountName, accountNumber, receivingLimit } = req.body;

        if (!bankName || !accountName || !accountNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newMethod = new paymentMethodsModel({
            bankName,
            accountName,
            accountNumber,
            receivingLimit
        });

        await newMethod.save();

        res.status(201).json({ message: "Payment method added successfully", paymentMethod: newMethod });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await paymentMethodsModel.findByIdAndDelete(id);

        if (!deleted) return res.status(404).json({ message: "Payment method not found" });

        res.json({ message: "Payment method deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;