import React, { useEffect, useState } from 'react'
import { Image } from 'antd'
import { MessageSquare, Pencil, Search, Trash2, User2, XIcon } from 'lucide-react'
import dayjs from 'dayjs'
import axios from 'axios'

export default function SessionRequests() {
    const [sessions, setSessions] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchText, setSearchText] = useState("")
    const [activeSearch, setActiveSearch] = useState("")
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (activeSearch) {
            fetchSearchedSessions(activeSearch, page)
        } else {
            fetchSessions(page)
        }
    }, [page, activeSearch])

    const fetchSessions = (page) => {
        setLoading(true)
        axios.get(`${import.meta.env.VITE_HOST}/admin/session-requests/all?page=${page}`)
            .then(res => {
                const { status, data } = res
                if (status === 200) {
                    setSessions(data?.sessions || [])
                    setTotalPages(Math.ceil(data?.totalSessions / 20))
                }
            })
            .catch(err => console.error('Frontend GET error', err.message))
            .finally(() => setLoading(false))
    }

    const fetchSearchedSessions = (text, page) => {
        setLoading(true)
        axios.get(`${import.meta.env.VITE_HOST}/admin/session-requests/search?searchText=${text}&page=${page}`)
            .then(res => {
                if (res.status === 200) {
                    setSessions(res.data?.sessions || [])
                    setTotalPages(Math.ceil(res?.data?.totalSearchedSessions / 20))
                }
            })
            .catch(err => console.error('Frontend GET error', err.message))
            .finally(() => setLoading(false))
    }

    const handleSearch = () => {
        if (!searchText) {
            setActiveSearch("")
            setPage(1)
            return
        }
        setActiveSearch(searchText)
        setPage(1)
    }

    const handleUpdateSessionStatus = async (newStatus) => {
        setLoading(true);
        try {
            const res = await axios.put(`${import.meta.env.VITE_HOST}/admin/session-requests/update-status/${selectedSession._id}`,
                { status: newStatus, duration: selectedSession.plan.duration, price: selectedSession.plan.price, chatterID: selectedSession.chatterID._id }
            );
            if (res.status === 202) {
                setShowUpdateModal(false);
                setSelectedSession(null);
                window.toastify("Session status updated!", "success");

                if (activeSearch) {
                    fetchSearchedSessions(activeSearch, page);
                } else {
                    fetchSessions(page);
                }
            }
        } catch (err) {
            console.error("Frontend UPDATE error", err.message);
            window.toastify(err.response.data.message || "Something went wrong! Please try again.", "error")
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this session?");
        if (!confirmDelete) return;

        setLoading(true)
        axios.delete(`${import.meta.env.VITE_HOST}/admin/session-requests/delete/${id}`)
            .then(res => {
                window.toastify?.(res.data.message, "success")
                setSessions(prev => prev.filter(session => session._id !== id))
            })
            .catch(err => {
                console.error(err)
                window.toastify?.("Failed to delete payment method", "error")
            })
            .finally(() => setLoading(false))
    }

    const renderPageNumbers = () => {
        const pages = []
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    className={`px-3 py-1 cursor-pointer hover:!bg-[#666] hover:!text-white ${page === i ? 'bg-[var(--secondary)]/75 text-white' : 'bg-white !text-gray-700'}`}
                    onClick={() => setPage(i)}
                >
                    {i}
                </button>
            )
        }
        return pages
    }

    return (
        <div className='admin-container'>
            <h1 className='flex items-center gap-1 text-xl'><MessageSquare size={20} /> Session Requests</h1>
            <p className='w-fit px-2 py-0.5 text-sm text-[var(--secondary)] bg-[var(--light)]/50 rounded mt-1'>Manage session requests between user and chatter</p>

            <div className='flex justify-between items-center gap-5 mt-6'>
                <p className='w-fit text-[12px] font-bold'><span className='text-gray-500'>Admin</span> / Sessions</p>

                <div className='flex flex-1 justify-end items-center gap-2.5'>
                    <input type="text" name="searchText" id="searchText" value={searchText} placeholder='Search by session id, username or email' className='w-full border border-gray-200 max-w-[280px] text-sm bg-white' onChange={e => setSearchText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                    <button className='flex items-center gap-1 text-sm text-white bg-[var(--secondary)] p-3 rounded-xl transition-all duration-150 ease-linear hover:bg-[var(--secondary)]/70' onClick={handleSearch}>Search <Search size={14} /></button>
                </div>
            </div>

            <div className="relative overflow-x-auto border border-gray-200 mt-5 rounded-xl">
                <table className="w-full text-xs text-left rtl:text-right text-gray-600">
                    <thead className="text-[10px] text-[var(--secondary)] bg-white uppercase border-b border-gray-200">
                        <tr>
                            <th scope="col" className="font-bold px-6 py-4">Session ID</th>
                            <th scope="col" className="font-bold px-6 py-4">User Name</th>
                            <th scope="col" className="font-bold px-6 py-4">Chatter Name</th>
                            <th scope="col" className="font-bold px-6 py-4">Plan</th>
                            <th scope="col" className="font-bold px-6 py-4">Method</th>
                            <th scope="col" className="font-bold px-6 py-4">Transaction ID</th>
                            <th scope="col" className="font-bold px-6 py-4">Paid At</th>
                            <th scope="col" className="font-bold px-6 py-4">Status</th>
                            <th scope="col" className="font-bold px-6 py-4 text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            loading ?
                                <tr className='bg-white'>
                                    <td colSpan={9} className='py-20'>
                                        <div className='flex justify-center'>
                                            <div className='flex flex-col items-center gap-5'>
                                                <span className='w-8 h-8 rounded-full border-t-2 border-[var(--secondary)] animate-spin'></span>
                                                <p>Loading...</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                :
                                sessions.length > 0 ?
                                    sessions.map((session) => (
                                        <tr key={session._id} className="bg-white border-b border-gray-200">
                                            <td className="px-6 py-4">{session._id}</td>
                                            <td className="px-6 py-4 font-bold">{session.userID.username}</td>
                                            <td className="px-6 py-4 font-bold">{session.chatterID.username}</td>
                                            <td className="px-6 py-4 capitalize">{session.plan.title} {session.plan.price} PKR</td>
                                            <td className="px-6 py-4">{session.bankName}</td>
                                            <td className="px-6 py-4">{session.transactionID}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{dayjs(session.createdAt).format('DD-MM-YYYY HH:mm')}</td>
                                            <td className="px-6 py-4 capitalize">
                                                <span className={`text-[10px] px-2 py-1 font-bold rounded ${session.status === 'completed' ? 'text-[#0ec520] bg-[#d1ffd5]' : session.status === 'pending' ? 'text-[#4b8fd9] bg-[#e4f1ff]' : 'text-[#d94b4b] bg-[#ffe4e4]'}`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className='flex justify-end gap-2'>
                                                    <Pencil size={14} className='text-[16px] text-blue-500 cursor-pointer hover:text-blue-300'
                                                        onClick={() => {
                                                            setSelectedSession(session);
                                                            setShowUpdateModal(true);
                                                        }}
                                                    />
                                                    <Trash2 size={14} className='text-red-500 cursor-pointer hover:text-red-300' onClick={() => handleDelete(session._id)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                    :
                                    <tr className='bg-white'>
                                        <td colSpan={8} className='px-6 py-4 text-center text-red-500'>No session found!</td>
                                    </tr>
                        }
                    </tbody>
                </table>
            </div>

            {
                !loading &&
                totalPages > 1 &&
                <div className='flex flex-wrap my-8 items-center justify-center gap-1'>
                    {renderPageNumbers()}
                </div>
            }

            {/* Update Modal */}
            <div className={`flex justify-end fixed top-0 right-0 w-full bg-black/20 h-screen transition-all duration-200 ease-linear ${showUpdateModal ? 'visible opacity-100' : 'invisible opacity-0'}`}
                onClick={() => setShowUpdateModal(false)}
            >
                <div className={`flex flex-col justify-between w-full max-w-[500px] h-full bg-white transition-all duration-300 ease-linear ${showUpdateModal ? 'translate-x-0' : 'translate-x-full'}`}
                    onClick={e => e.stopPropagation()}
                >
                    <div className='flex justify-between items-center p-6 border-b border-b-gray-200'>
                        <p className='font-bold'>Manage Session Approval</p>
                        <XIcon size={18} className='cursor-pointer hover:text-red-500' onClick={() => setShowUpdateModal(false)} />
                    </div>

                    <div className='flex flex-col gap-3 flex-1 p-6 overflow-auto'>
                        <div className='p-4 bg-blue-50 border border-blue-100 rounded-2xl'>
                            <p className='text-sm text-blue-600 font-bold'>User Information</p>
                            <div className='flex justify-between items-center gap-4'>
                                <div className='flex items-center gap-3 mt-3'>
                                    <div className='flex justify-center items-center w-12 h-12 bg-gray-200 rounded-full overflow-hidden'>
                                        {
                                            selectedSession?.userID.avatar ?
                                                <Image src={selectedSession?.userID.avatar} className='w-full h-full object-cover' />
                                                :
                                                <User2 size={18} />
                                        }
                                    </div>
                                    <div>
                                        <p className='text-sm text-gray-700'><span className='font-bold'>Username:</span> {selectedSession?.userID.username}</p>
                                        <p className='text-sm text-gray-700'><span className='font-bold'>Email:</span> {selectedSession?.userID.email}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className='text-sm text-gray-700'><span className='font-bold'>Age:</span> {selectedSession?.userID.age}</p>
                                    <p className='text-sm text-gray-700 capitalize'><span className='font-bold'>Gender:</span> {selectedSession?.userID.gender}</p>
                                </div>
                            </div>
                        </div>

                        <div className='p-4 bg-blue-50 border border-blue-100 rounded-2xl'>
                            <p className='text-sm text-blue-600 font-bold'>Chatter Information</p>
                            <div className='flex justify-between items-center gap-4'>
                                <div className='flex items-center gap-3 mt-3'>
                                    <div className='flex justify-center items-center w-12 h-12 bg-gray-200 rounded-full overflow-hidden'>
                                        {
                                            selectedSession?.chatterID.avatar ?
                                                <Image src={selectedSession?.chatterID.avatar} className='w-full h-full object-cover' />
                                                :
                                                <User2 size={18} />
                                        }
                                    </div>
                                    <div>
                                        <p className='text-sm text-gray-700'><span className='font-bold'>Username:</span> {selectedSession?.chatterID.username}</p>
                                        <p className='text-sm text-gray-700'><span className='font-bold'>Email:</span> {selectedSession?.chatterID.email}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className='text-sm text-gray-700'><span className='font-bold'>Age:</span> {selectedSession?.chatterID.age}</p>
                                    <p className='text-sm text-gray-700 capitalize'><span className='font-bold'>Gender:</span> {selectedSession?.chatterID.gender}</p>
                                </div>
                            </div>
                        </div>

                        <div className='border-b border-gray-300 pb-4'>
                            <div className='mt-4'>
                                <p className='text-sm text-[var(--hard)] font-bold mb-2'>Plan Purchased</p>
                                <p className='text-xl font-bold'>{selectedSession?.plan?.title}</p>
                                <p><span className='font-bold'>Price:</span> {selectedSession?.plan?.price}</p>
                                <p><span className='font-bold'>Duration:</span> {selectedSession?.plan?.duration} Minutes</p>
                            </div>
                        </div>

                        <div className='pb-4'>
                            <p className='text-sm text-[var(--hard)] font-bold mt-3'>Payment Information</p>
                            <div className='mt-2'>
                                <p><span className='font-bold'>Bank Name:</span> {selectedSession?.bankName}</p>
                                <p><span className='font-bold'>Account Name:</span> {selectedSession?.accountName}</p>
                                <p><span className='font-bold'>Account Number:</span> {selectedSession?.accountNumber}</p>
                                <p><span className='font-bold'>Paid Amount:</span> {selectedSession?.amountPaid}</p>
                                <p className='mt-4'><span className='font-bold'>Transaction ID:</span> {selectedSession?.transactionID}</p>
                                <p className='font-bold mb-2'>Transaction Screenshot:</p>
                                <Image src={selectedSession?.transactionSS} />
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-end gap-3 p-6'>
                        <button className='px-4 py-1.5 bg-gray-200 text-gray-800 rounded-lg transition-all duration-200 ease-linear hover:opacity-70' onClick={() => setShowUpdateModal(false)}>Cancel</button>
                        <button className='px-4 py-1.5 bg-red-500 text-white rounded-lg transition-all duration-200 ease-linear hover:opacity-70'
                            onClick={() => handleUpdateSessionStatus("rejected")}
                        >
                            Reject
                        </button>
                        <button className='px-4 py-1.5 bg-[var(--secondary)] text-white rounded-lg transition-all duration-200 ease-linear hover:opacity-70'
                            onClick={() => handleUpdateSessionStatus("completed")}
                        >
                            Complete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}