const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const authModel = require("../models/auth");
const verifyToken = require("../middlewares/auth")

const defaultPlans = [
    { title: "Basic", duration: 30, price: 500, description: "30 minutes chat" },
    { title: "Standard", duration: 60, price: 900, description: "1 hour chat" },
    { title: "Gold", duration: 90, price: 1200, description: "1 hour 30 minutes chat" },
];

router.post("/signup", async (req, res) => {
    try {
        const { username, email, password, role, phoneNumber, age, gender } = req.body;

        if (!username || !email || !password) return res.status(400).json({ message: "All fields are required!" })

        const existingUser = await authModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            username,
            email,
            password: hashedPassword,
            role: role,
            phoneNumber,
            age,
            gender,
            status: role === "chatter" ? "pending" : "approved",
            plans: role === "chatter" ? defaultPlans : [],
        }

        const user = await authModel.create(newUser)

        const message = role === "chatter"
            ? "Your application has been submitted. Admin will review it soon!"
            : "Signup successful! Redirecting to login..."

        res.status(201).json({ message, user });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username_email, password } = req.body

        const user = await authModel.findOne({ $or: [{ username: username_email }, { email: username_email }] });
        if (!user) {
            return res.status(404).json({ message: 'Invalid username or password!' })
        }

        if (user.role === "chatter" && user.status === "pending") {
            return res.status(403).json({ message: "Your account is pending admin approval." });
        }
        
        if (user.role === "chatter" && user.status === "rejected") {
            return res.status(403).json({ message: "Your account approval is reject by admin." });
        }

        if (user.status === "banned") {
            return res.status(403).json({ message: "Your account has been banned by admin." });
        }

        const matchedPassword = await bcrypt.compare(password, user.password)

        if (matchedPassword) {
            const { _id } = user
            const token = jwt.sign({ _id }, "secret-key", { expiresIn: '30d' })

            res.status(200).json({ message: 'User logged in successfully!', token, user })
        }
        else {
            res.status(401).json({ message: 'Invalid username or password!' })
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message })
    }
});

router.get("/user", verifyToken, async (req, res) => {
    try {
        const _id = req._id
        const user = await authModel.findById(_id)

        if (!user) {
            return res.status(404).json({ message: 'User not found!' })
        }

        res.status(200).json({ message: 'User found', user })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message })
    }
});

module.exports = router;