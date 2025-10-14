import React, { useEffect, useRef, useState } from 'react'
import { Image } from 'antd'
import PaymentWindow from '../PaymentWindow'
import { Mic, SendHorizonal } from 'lucide-react'
import dayjs from 'dayjs'
import axios from 'axios'
import { io } from "socket.io-client";

export default function ChatWindow({ user, selectedChatter }) {
    const [session, setSession] = useState(null)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([])
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(true)
    const [loadingMessages, setLoadingMessages] = useState(true)
    const [timeLeft, setTimeLeft] = useState(null)
    const messagesEndRef = useRef(null)

    const [isRecording, setIsRecording] = useState(false)
    const [recordDuration, setRecordDuration] = useState(0)
    const [isUploadingVoice, setIsUploadingVoice] = useState(false)
    const mediaRecorderRef = useRef(null)
    const mediaStreamRef = useRef(null)
    const recordedChunksRef = useRef([])
    const recordTimerRef = useRef(null)
    const recordStartRef = useRef(null)

    useEffect(() => {
        if (!selectedChatter || !user) return

        const fetchSessionStatus = async () => {
            setLoading(true)
            try {
                const isChatter = user?.role === 'chatter';

                const res = await axios.get(`${import.meta.env.VITE_HOST}/user/session/check`, {
                    params: {
                        userID: isChatter ? selectedChatter._id : user._id,
                        chatterID: isChatter ? user._id : selectedChatter._id,
                    }
                })
                setSession(res.data.session || null)
            } catch (err) {
                console.error(err)
            }
            setLoading(false)
        }

        fetchSessionStatus()
    }, [selectedChatter, user, selectedPlan])

    useEffect(() => {
        if (!session || session.status !== "completed" || !session.endTime) return

        const interval = setInterval(() => {
            const now = dayjs()
            const end = dayjs(session.endTime)
            const diff = end.diff(now, "second")

            if (diff <= 0) {
                clearInterval(interval)
                setTimeLeft(0)
                setSession(null)
            } else {
                const minutes = Math.floor(diff / 60)
                const seconds = diff % 60
                setTimeLeft(`${minutes}m : ${seconds < 10 ? '0' + seconds : seconds}s`)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [session])

    useEffect(() => {
        if (!session?._id) return;

        const fetchMessages = async () => {
            try {
                setLoadingMessages(true)
                const res = await axios.get(`${import.meta.env.VITE_HOST}/messages/fetch/${session._id}`);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to load messages", err);
            } finally {
                setLoadingMessages(false)
            }
        };

        fetchMessages();
    }, [session?._id]);

    useEffect(() => {
        const s = io(import.meta.env.VITE_HOST, { transports: ["websocket"] });

        s.on("connect", () => console.log("Connected to chat"));
        s.on("disconnect", () => console.log("Disconnected from chat"));
        s.on("connect_error", (err) => console.error("Connection error:", err));

        setSocket(s);
        return () => s.disconnect();
    }, []);

    // 🔸 Join session room once session is ready
    useEffect(() => {
        if (socket && session?._id) {
            socket.emit("joinSession", session._id);
        }
    }, [socket, session]);

    // 🔸 Listen for incoming messages
    useEffect(() => {
        if (!socket) return;

        socket.on("receiveMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, [socket]);

    // 🔸 Auto-scroll to bottom when new message arrives
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        if (!text.trim() || !session) return;

        const msg = {
            sessionID: session._id,
            senderID: user._id,
            receiverID: selectedChatter._id,
            message: text,
            type: "text",
        };

        socket.emit("sendMessage", msg);
        setText("");
    };




    // ----------------- Recording handlers -----------------

    const startRecording = async () => {
        if (!session) return alert("No active session to send a voice message.");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            recordedChunksRef.current = [];
            const options = {} // leave blank for browser default format (usually webm)
            const mr = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mr;

            mr.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
            };

            mr.onstop = async () => {
                clearInterval(recordTimerRef.current);
                setIsRecording(false);

                // create blob
                const blob = new Blob(recordedChunksRef.current, { type: recordedChunksRef.current[0]?.type || 'audio/webm' });
                // upload
                await uploadVoice(blob, recordDuration);
                // stop tracks
                if (mediaStreamRef.current) {
                    mediaStreamRef.current.getTracks().forEach(t => t.stop());
                }
                setRecordDuration(0);
            };

            mr.start();
            setIsRecording(true);
            recordStartRef.current = Date.now();
            setRecordDuration(0);
            recordTimerRef.current = setInterval(() => {
                const sec = Math.floor((Date.now() - recordStartRef.current) / 1000);
                setRecordDuration(sec);
            }, 250);
        } catch (err) {
            console.error("Recording error:", err);
            alert("Could not access microphone. Please allow microphone permission.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        } else {
            // ensure cleanup
            setIsRecording(false);
            clearInterval(recordTimerRef.current);
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
            }
            setRecordDuration(0);
        }
    };

    const uploadVoice = async (blob, durationSec = 0) => {
        try {
            setIsUploadingVoice(true);
            const fileName = `voice_${Date.now()}.webm`;
            const file = new File([blob], fileName, { type: blob.type || 'audio/webm' });

            const formData = new FormData();
            formData.append('voice', file);
            formData.append('sessionID', session._id);
            formData.append('senderID', user._id);
            formData.append('receiverID', selectedChatter._id);
            formData.append('duration', String(durationSec));

            const res = await axios.post(`${import.meta.env.VITE_HOST}/voice-message/send`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (!res.data?.success) {
                console.error('Upload failed', res.data);
                alert('Voice upload failed');
            }
            // no need to manually push to messages — server emits to room and socket.on('receiveMessage') will add it.
        } catch (err) {
            console.error('Upload voice error:', err);
            alert('Failed to upload voice message');
        } finally {
            setIsUploadingVoice(false);
        }
    };




    // ---------- Render & UI ----------

    if (loading) {
        return (
            <div className='flex flex-col justify-center items-center gap-6 h-full p-4'>
                <div className='w-10 h-10 border-t border-[var(--primary)] rounded-full animate-spin'></div>
                <p className='text-gray-700'>Checking session...</p>
            </div>
        )
    }

    const isSessionExpired = session && dayjs().isAfter(dayjs(session.endTime));

    if (!session || session?.status === "rejected" || isSessionExpired) {
        return (
            <div className='w-full h-full flex flex-col p-10 gap-16'>
                {
                    selectedChatter.role === "chatter" ?
                        <>
                            <div className='flex flex-col items-center bg-white p-6 rounded-xl shad'>
                                <div className='flex justify-center items-center w-16 h-16 bg-[var(--primary)] text-white rounded-full overflow-hidden'>
                                    {
                                        selectedChatter.avatar ?
                                            <Image src={selectedChatter.avatar} alt="profile" className='w-full h-full object-cover' />
                                            :
                                            <p className='text-xl uppercase'>{selectedChatter.username.slice(0, 2)}</p>
                                    }
                                </div>
                                <p className='text-gray-700 mt-4'><span className='font-bold'>Name:</span> {selectedChatter.username}</p>
                                <div className='flex gap-3 mt-0.5'>
                                    <p className='text-gray-700'><span className='font-bold'>Gender:</span> <span className='capitalize'>{selectedChatter.gender}</span></p>
                                    <p className='text-gray-700'><span className='font-bold'>Age:</span> {selectedChatter.age}</p>
                                </div>
                            </div>

                            <div className='flex justify-center items-center gap-6'>
                                {
                                    selectedChatter?.plans?.map((plan, i) => (
                                        <div key={i} className='flex-1 bg-white p-6 rounded-xl shad'>
                                            <p className='w-fit px-2 py-0.5 rounded-lg text-sm text-[var(--hard)] bg-[var(--light)] mb-2'>{plan.title}</p>
                                            <h1 className='text-4xl text-[var(--dark)]'>{plan.price} PKR</h1>
                                            <p className='text-sm text-gray-600 mt-8'>{plan.description}</p>
                                            <button className='mt-4 text-center bg-[var(--primary)] text-white w-full p-3 rounded-xl transition-all duration-300 ease-out hover:opacity-70'
                                                onClick={() => setSelectedPlan(plan)}
                                            >
                                                Buy now
                                            </button>
                                        </div>
                                    ))
                                }
                            </div>
                        </>
                        :
                        <div>There is no session</div>
                }

                {
                    selectedPlan &&
                    <PaymentWindow selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} user={user} selectedChatter={selectedChatter} />
                }
            </div>
        )
    }

    if (session?.status == "pending") {
        return (
            <div className='w-ful h-full flex flex-col justify-center items-center'>
                <h1 className='text-2xl text-[var(--hard)] mb-1'>Approval Pending</h1>
                <p className='text-gray-600'>Your chat approval is pending. Admin will review it soon!</p>
            </div>
        )
    }

    if (session?.status === "completed") {
        return (
            <div className='flex flex-col justify-between w-full h-screen p-6'>
                <div className='flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100'>
                    <div className='flex gap-3 items-center'>
                        <div className='flex justify-center items-center w-12 h-12 bg-[var(--primary)] text-white rounded-full overflow-hidden'>
                            {
                                selectedChatter.avatar ?
                                    <Image src={selectedChatter.avatar} className='w-full h-full object-cover' />
                                    :
                                    <p>{selectedChatter.username.slice(0, 2)}</p>
                            }
                        </div>
                        <p className='text-gray-800 font-bold'>{selectedChatter.username}</p>
                    </div>
                    <div className='flex flex-col items-center'>
                        <p className='text-sm text-gray-700 leading-tight'>Time remaining:</p>
                        <span className='font-semibold text-gray-700'>{timeLeft || '...'}</span>
                    </div>
                </div>

                <div className='flex-1 overflow-y-auto min-h-0'>
                    {
                        loadingMessages ?
                            <div className='w-full h-full flex flex-col justify-center items-center gap-4'>
                                <div className='w-10 h-10 border-t border-[var(--primary)] rounded-full animate-spin'></div>
                                <p className='text-gray-700'>Loading message...</p>
                            </div>
                            :
                            <div className='flex flex-col justify-end min-h-full px-12 py-6'>
                                <div className='flex flex-col gap-3'>
                                    {messages.map((msg) => (
                                        // <div
                                        //     key={msg._id}
                                        //     className={`flex ${msg.senderID === user._id ? "justify-end" : "justify-start"}`}
                                        // >
                                        //     <p className={`w-fit max-w-[70%] text-sm px-3 py-1.5 rounded-2xl break-all ${msg.senderID === user._id ? "bg-[var(--secondary)] text-white" : "bg-gray-200 text-gray-800"}`}>
                                        //         {msg.message}
                                        //         <div className='flex justify-end'>
                                        //             <span className='text-[10px]'>{dayjs(msg.createdAt).format('h:mm A')}</span>
                                        //         </div>
                                        //     </p>
                                        // </div>
                                        <div
                                            key={msg._id}
                                            className={`flex ${String(msg.senderID) === String(user._id) ? "justify-end" : "justify-start"}`}
                                        >
                                            {msg.type === 'voice' ? (
                                                <div className={`w-fit max-w-[70%] text-sm px-3 py-1.5 rounded-2xl break-all ${String(msg.senderID) === String(user._id) ? "bg-[var(--secondary)] text-white" : "bg-gray-200 text-gray-800"}`}>
                                                    <audio controls src={msg.voiceURL || msg.message} />
                                                    <div className='flex justify-end'>
                                                        <span className='text-[10px]'>{dayjs(msg.createdAt).format('h:mm A')}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className={`w-fit max-w-[70%] text-sm px-3 py-1.5 rounded-2xl break-all ${String(msg.senderID) === String(user._id) ? "bg-[var(--secondary)] text-white" : "bg-gray-200 text-gray-800"}`}>
                                                    {msg.message}
                                                    <div className='flex justify-end'>
                                                        <span className='text-[10px]'>{dayjs(msg.createdAt).format('h:mm A')}</span>
                                                    </div>
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                    {isUploadingVoice && (
                                        <div className="flex justify-end my-2">
                                            <div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-2xl">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Sending voice...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                    }
                </div>

                <div className='flex gap-4 items-center'>
                    <input type="text" name="message" id="message" value={text} placeholder='Type message...' className='flex-1 bg-white border border-gray-300'
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />

                    {/* <button className='flex justify-center items-center w-12 h-12 bg-[var(--secondary)] rounded-full transition-all duration-200 ease-out hover:bg-[var(--secondary)]/70'><Mic size={18} className='text-white' /></button> */}

                    <div className='flex items-center gap-2'>
                        <button
                            className={`flex justify-center items-center w-12 h-12 ${isRecording ? 'bg-red-600' : 'bg-[var(--secondary)]'} rounded-full transition-all duration-200 ease-out`}
                            onClick={() => isRecording ? stopRecording() : startRecording()}
                            disabled={isUploadingVoice}
                            title={isRecording ? 'Stop recording' : 'Record voice'}
                        >
                            <Mic size={18} className='text-white' />
                        </button>

                        {/* small recording indicator */}
                        {isRecording && (
                            <div className='flex flex-col items-start'>
                                <div className='text-xs text-red-600'>Recording • {Math.floor(recordDuration / 60)}:{(recordDuration % 60).toString().padStart(2, '0')}</div>
                            </div>
                        )}
                    </div>

                    <button className='flex justify-center items-center w-12 h-12 bg-[var(--secondary)] rounded-full transition-all duration-200 ease-out hover:bg-[var(--secondary)]/70'
                        onClick={handleSendMessage}
                    >
                        <SendHorizonal size={18} className='text-white' />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            Something went wrong!
        </div>
    )
}