import React, { useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'
import { CreditCard, DollarSign, LogOut, MessageSquare, UserRound } from 'lucide-react'
import Chats from './Chats'
import Profile from './Profile'
import Payments from './Payments'
import Withdraws from './Withdraws'
import { io } from "socket.io-client"

export default function Dashboard() {
    const { user, handleLogout } = useAuthContext()
    const navigate = useNavigate()
    const location = useLocation()
    const [socket, setSocket] = useState(null);

    const isActive = (path) => location.pathname.includes(path)

    useEffect(() => {
        if (!user?._id) return;
        const newSocket = io(import.meta.env.VITE_HOST, { transports: ["websocket"] });
        setSocket(newSocket);

        newSocket.on("connect", () => {
            newSocket.emit("userOnline", user._id);
        });

        return () => newSocket.disconnect();
    }, [user?._id]);

    return (
        <div className='flex h-screen'>
            <div className='px-2 py-10 h-full bg-[var(--hard)]'>
                <div className='h-full flex flex-col justify-between items-center'>
                    <div className='flex flex-col gap-8'>
                        <button className={`p-3 rounded-lg transition-all duration-200 ease-linear hover:bg-[var(--secondary)]
                        ${isActive('/dashboard/profile') ? 'bg-[var(--secondary)]' : 'hover:bg-[var(--secondary)]'}`}
                            onClick={() => navigate('/dashboard/profile')}
                        >
                            <UserRound size={18} className='text-white' />
                        </button>
                        <button className={`p-3 rounded-lg transition-all duration-200 ease-linear hover:bg-[var(--secondary)]
                         ${isActive('/dashboard/chats') || location.pathname === '/dashboard' ? 'bg-[var(--secondary)]' : 'hover:bg-[var(--secondary)]'}`}
                            onClick={() => navigate('/dashboard/chats')}
                        >
                            <MessageSquare size={18} className='text-white' />
                        </button>
                        <button className={`p-3 rounded-lg transition-all duration-200 ease-linear hover:bg-[var(--secondary)]
                         ${isActive('/dashboard/payments') ? 'bg-[var(--secondary)]' : 'hover:bg-[var(--secondary)]'}`}
                            onClick={() => navigate('/dashboard/payments')}
                        >
                            <CreditCard size={18} className='text-white' />
                        </button>
                        {user?.role === "chatter" &&
                            <button className={`p-3 rounded-lg transition-all duration-200 ease-linear hover:bg-[var(--secondary)]
                            ${isActive('/dashboard/withdraws') ? 'bg-[var(--secondary)]' : 'hover:bg-[var(--secondary)]'}`}
                                onClick={() => navigate('/dashboard/withdraws')}
                            >
                                <DollarSign size={18} className='text-white' />
                            </button>
                        }
                    </div>

                    <button onClick={() => handleLogout()}><LogOut size={18} className='text-white transition-all duration-150 ease-linear hover:text-red-500' /></button>
                </div>
            </div>

            <div className='flex-1 h-full overflow-x-hidden'>
                <Routes>
                    <Route index element={<Chats socket={socket} />} />
                    <Route path='chats' element={<Chats socket={socket} />} />
                    <Route path='profile' element={<Profile />} />
                    <Route path='payments' element={<Payments />} />
                    <Route path='withdraws' element={<Withdraws />} />
                </Routes>
            </div>
        </div>
    )
}