import React, { useEffect, useState } from 'react'
import { Image } from 'antd'
import axios from 'axios'
import { useAuthContext } from '../../contexts/AuthContext'

export default function UserChatsSection({ handleSelectChatter, socket }) {
    const { user } = useAuthContext()
    const [sessions, setSessions] = useState([])
    const [users, setUsers] = useState([])
    const [initialChatters, setInititalChatters] = useState([])
    const [searchText, setSearchText] = useState("")
    const [searchPerformed, setSearchPerformed] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const value = e.target.value
        setSearchText(value)

        if (value.trim() === "") {
            setUsers([])
            setSearchPerformed(false)
        }
    }

    useEffect(() => {
        const fetchInitialChatters = async () => {
            setLoading(true)
            axios.get(`${import.meta.env.VITE_HOST}/user/chatters/initial-fetch`)
                .then(res => {
                    setInititalChatters(res.data.users || [])
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false))
        }

        fetchInitialChatters()
    }, [])

    useEffect(() => {
        const fetchUserSessions = async () => {
            setLoading(true)
            axios.get(`${import.meta.env.VITE_HOST}/user/chatters/fetch-sessions?userID=${user._id}`)
                .then(res => {
                    const fetchedSessions = res.data.sessions || [];
                    setSessions(fetchedSessions);

                    setInititalChatters(prev =>
                        prev.filter(chatter => !fetchedSessions.some(session => session._id === chatter._id))
                    );
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false))
        }

        fetchUserSessions()
    }, [user._id])

    const handleSearch = () => {
        const trimmed = searchText.trim()
        if (!trimmed) {
            setUsers([])
            setSearchPerformed(false)
            return
        }

        setLoading(true)
        setSearchPerformed(true)
        axios.get(`${import.meta.env.VITE_HOST}/user/chatters/search?searchText=${trimmed}`)
            .then(res => {
                setUsers(res.data.users || [])
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (!socket) return;

        socket.on("userStatusUpdate", ({ userID, isOnline, lastSeen }) => {
            const updateUserStatus = (arrSetter) => {
                arrSetter(prev =>
                    prev.map(u =>
                        u._id === userID
                            ? { ...u, isOnline, lastSeen }
                            : u
                    )
                );
            };

            // Update in all three lists
            updateUserStatus(setUsers);
            updateUserStatus(setSessions);
            updateUserStatus(setInititalChatters);
        });

        return () => socket.off("userStatusUpdate");
    }, [socket]);

    const displayUsers = searchPerformed ? users : [...sessions, ...initialChatters]

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
                displayUsers.length > 0 ? (
                    displayUsers.map(user => (
                        <div key={user._id} className='flex justify-between p-4 border-b border-gray-200 transition-all duration-200 ease cursor-pointer hover:bg-gray-100'
                            onClick={() => handleSelectChatter(user)}
                        >
                            <div className='flex items-center gap-3'>
                                <div className='relative flex justify-center items-center w-12 h-12 bg-[var(--primary)] text-white rounded-full'>
                                    {
                                        user.avatar ?
                                            <div className='w-full h-full overflow-hidden rounded-full'>
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
                            {searchPerformed ? "No user found!" : "No chatters available!"}
                        </p>
                    </div>
                )
            )}
        </div>
    )
}