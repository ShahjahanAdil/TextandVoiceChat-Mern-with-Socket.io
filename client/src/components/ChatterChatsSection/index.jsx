import React, { useEffect, useState } from 'react'
import { Image } from 'antd'
import axios from 'axios'
import { useAuthContext } from '../../contexts/AuthContext'

export default function ChatterChatsSection({ handleSelectChatter, socket }) {
    const { user } = useAuthContext()
    const [sessions, setSessions] = useState([])
    const [searchText, setSearchText] = useState("")
    const [searchPerformed, setSearchPerformed] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleChange = async (e) => {
        const value = e.target.value
        setSearchText(value)

        if (value.trim() === "") {
            setSearchPerformed(false);
            setLoading(true);
            try {
                const res = await axios.get(`${import.meta.env.VITE_HOST}/chatter/users/fetch-sessions?chatterID=${user._id}`);
                setSessions(res.data.sessions || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        const fetchChatterSessions = async () => {
            setLoading(true)
            axios.get(`${import.meta.env.VITE_HOST}/chatter/users/fetch-sessions?chatterID=${user._id}`)
                .then(res => {
                    setSessions(res.data.sessions || []);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false))
        }

        fetchChatterSessions()
    }, [user._id])

    const handleSearch = () => {
        const trimmed = searchText.trim()
        if (!trimmed) {
            setSearchPerformed(false)
            return
        }

        setLoading(true)
        setSearchPerformed(true)
        axios.get(`${import.meta.env.VITE_HOST}/chatter/users/search?searchText=${trimmed}&&chatterID=${user._id}`)
            .then(res => {
                setSessions(res.data.users || [])
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (!socket) return;

        socket.on("userStatusUpdate", ({ userID, isOnline, lastSeen }) => {
            setSessions(prev =>
                prev.map(u =>
                    u._id === userID
                        ? { ...u, isOnline, lastSeen }
                        : u
                )
            )
        });

        return () => socket.off("userStatusUpdate");
    }, [socket]);

    return (
        <div className='w-[350px] h-screen bg-white border-r border-gray-200 rounded-tr-3xl rounded-br-3xl overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
                <h1 className='text-xl text-[var(--hard)]'>Chats</h1>
                <input type="text" name="searchText" id="searchText" value={searchText} placeholder='Search users for chat...' className='w-full border border-gray-200 mt-3' onChange={handleChange} onKeyDown={e => e.key === "Enter" && handleSearch()} />
            </div>

            {loading ? (
                <div className='flex flex-col justify-center items-center gap-4 h-50'>
                    <div className='w-10 h-10 border-t border-[var(--primary)] rounded-full animate-spin'></div>
                    <p className='text-sm text-gray-600'>Loading...</p>
                </div>
            ) : (
                sessions.length > 0 ? (
                    sessions.map(user => (
                        <div key={user._id} className='flex justify-between p-4 border-b border-gray-200 transition-all duration-200 ease cursor-pointer hover:bg-gray-100'
                            onClick={() => handleSelectChatter(user)}
                        >
                            <div className='flex items-center gap-3'>
                                <div className='relative flex justify-center items-center w-12 h-12 bg-[var(--primary)] text-white rounded-full'>
                                    {
                                        user.avatar ?
                                            <div className='w-full h-full rounded-full overflow-hidden'>
                                                <Image src={user.avatar} alt="profile" className='w-full h-full object-cover' />
                                            </div>
                                            :
                                            user.username?.slice(0, 2).toUpperCase()
                                    }

                                    {user.isOnline && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <p className='text-sm font-bold'>{user.username}</p>
                                    <p className='text-xs text-gray-700'>Age: {user.age}</p>
                                </div>
                            </div>

                            <div className='flex flex-col items-end gap-1.5'>
                                <p className='text-xs text-gray-700 capitalize'>{user.gender}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='p-4'>
                        <p className='text-center bg-red-50 text-red-500 rounded-md'>
                            {searchPerformed ? "No user found!" : "No sessions available!"}
                        </p>
                    </div>
                )
            )}
        </div>
    )
}