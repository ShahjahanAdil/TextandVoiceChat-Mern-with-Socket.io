const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { config } = require('dotenv');
const dayjs = require("dayjs");

const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());
app.use(cors());
config();

// const authModel = require("./models/auth")

mongoose.connect(process.env.MONGOURL, { dbName: "textvoicechat", connectTimeoutMS: 30000 })
    .then(async () => {
        console.log("Connected to MongoDB");

        // const result = await authModel.updateMany(
        //     {},
        //     {
        //         $set: {
        //             availableBalance: 0,
        //             pendingWithdraw: 0,
        //             totalWithdrawn: 0
        //         }
        //     }
        // );

        // console.log(`✅ Updated ${result.modifiedCount} users with new fields.`);
    }).catch((err) => { console.log(err) });

// const port = process.env.PORT || 8000;
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// })

const authRouter = require("./routes/auth")
const adminUsersRouter = require("./routes/adminUsers")
const adminAccountRequestsRouter = require("./routes/adminAccountRequests")
const adminSessionRequestsRouter = require("./routes/adminSessionRequests")
const adminPaymentMethodsRouter = require("./routes/adminPaymentMethods")
const adminWithdrawRequestsRouter = require("./routes/adminWithdrawRequests")
const userFetchChatterRouter = require("./routes/userFetchChatters")
const userSessionCheckRouter = require("./routes/userSessionCheck")
const userProfileRouter = require("./routes/userProfile")
const userPurchasePlanRouter = require("./routes/userPurchasePlan")
const chatterFetchSessionsRouter = require("./routes/chatterFetchSessions")
const chatterWithdrawsRouter = require("./routes/chatterWithdraws")
const sessionsHistoryRouter = require("./routes/sessionsHistory")
const fetchMessagesRouter = require("./routes/fetchMessages")
const sendVoiceMessageRouter = require("./routes/sendVoiceMessage")

app.use("/auth", authRouter)
app.use("/admin/users", adminUsersRouter)
app.use("/admin/account-requests", adminAccountRequestsRouter)
app.use("/admin/session-requests", adminSessionRequestsRouter)
app.use("/admin/payment-methods", adminPaymentMethodsRouter)
app.use("/admin/withdraw-requests", adminWithdrawRequestsRouter)
app.use("/user/chatters", userFetchChatterRouter)
app.use("/user/session", userSessionCheckRouter)
app.use("/user/profile", userProfileRouter)
app.use("/user/purchase", userPurchasePlanRouter)
app.use("/chatter/users", chatterFetchSessionsRouter)
app.use("/chatter/withdraws", chatterWithdrawsRouter)
app.use("/payments", sessionsHistoryRouter)
app.use("/messages", fetchMessagesRouter)
app.use("/voice-message", sendVoiceMessageRouter)

// Deleting expired session messages

const sessionModel = require("./models/session");
const messageModel = require("./models/message");

setInterval(async () => {
    try {
        const now = dayjs();
        const expiredSessions = await sessionModel.find({ endTime: { $lt: now.toDate() }, status: "completed" });

        for (const session of expiredSessions) {
            await messageModel.deleteMany({ sessionID: session._id });
        }
    } catch (err) {
        console.error("❌ Error cleaning expired messages:", err);
    }
}, 60 * 60 * 1000);

// Socket configuration 

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.set('io', io);

io.on("connection", (socket) => {
    // console.log("🟢 New client connected:", socket.id);

    socket.on("joinSession", (sessionID) => {
        socket.join(sessionID);
        // console.log(`📥 Socket ${socket.id} joined session ${sessionID}`);
    });

    socket.on("sendMessage", async (data) => {
        try {
            const { sessionID, senderID, receiverID, message, type } = data;

            const newMessage = await messageModel.create({
                sessionID,
                senderID,
                receiverID,
                message,
                type: type || "text",
            });

            io.to(sessionID).emit("receiveMessage", newMessage);
        } catch (err) {
            console.error("❌ Error sending message:", err);
        }
    });

    // socket.on("disconnect", () => {
    //     console.log(`🔴 Socket ${socket.id} disconnected`);
    // });
});

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`🚀 Server running on port ${port}`));