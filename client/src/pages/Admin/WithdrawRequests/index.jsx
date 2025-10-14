import React, { useEffect, useState } from 'react'
import { Image } from 'antd'
import { DollarSign, Pencil, Search, Trash2, XIcon } from 'lucide-react'
import dayjs from 'dayjs'
import axios from 'axios'

export default function WithdrawRequests() {
    const [withdrawRequests, setWithdrawRequests] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchText, setSearchText] = useState("")
    const [activeSearch, setActiveSearch] = useState("")
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedWithdrawRequest, setSelectedWithdrawRequest] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (activeSearch) {
            fetchSearchedWithdrawRequests(activeSearch, page)
        } else {
            fetchWithdrawRequests(page)
        }
    }, [page, activeSearch])

    const fetchWithdrawRequests = (page) => {
        setLoading(true)
        axios.get(`${import.meta.env.VITE_HOST}/admin/withdraw-requests/all?page=${page}`)
            .then(res => {
                const { status, data } = res
                if (status === 200) {
                    setWithdrawRequests(data?.withdrawRequests || [])
                    setTotalPages(Math.ceil(data?.totalWithdrawRequests / 20))
                }
            })
            .catch(err => console.error('Frontend GET error', err.message))
            .finally(() => setLoading(false))
    }

    const fetchSearchedWithdrawRequests = (text, page) => {
        setLoading(true)
        axios.get(`${import.meta.env.VITE_HOST}/admin/withdraw-requests/search?searchText=${text}&page=${page}`)
            .then(res => {
                if (res.status === 200) {
                    setWithdrawRequests(res.data?.withdrawRequests || [])
                    setTotalPages(Math.ceil(res?.data?.totalSearchedWithdrawRequests / 20))
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

    const handleUpdateWithdrawStatus = async () => {
        if (!newStatus) return alert("Please select a status");

        setLoading(true);
        try {
            const res = await axios.put(`${import.meta.env.VITE_HOST}/admin/withdraw-requests/update-status/${selectedWithdrawRequest._id}`, { status: newStatus });
            if (res.status === 202) {
                setShowUpdateModal(false);
                setSelectedWithdrawRequest(null);
                window.toastify("Withdraw status updated!", "success");

                if (activeSearch) {
                    fetchSearchedWithdrawRequests(activeSearch, page);
                } else {
                    fetchWithdrawRequests(page);
                }
            }
        } catch (err) {
            console.error("Frontend UPDATE error", err.message);
            window.toastify(err.response.data.message || "Something went wrong! Please try again.", "error")
        } finally {
            setNewStatus("")
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this withdraw?");
        if (!confirmDelete) return;

        setLoading(true)
        axios.delete(`${import.meta.env.VITE_HOST}/admin/withdraw-requests/delete/${id}`)
            .then(res => {
                window.toastify?.(res.data.message, "success")
                setWithdrawRequests(prev => prev.filter(withdraw => withdraw._id !== id))
            })
            .catch(err => {
                console.error(err)
                window.toastify?.("Failed to delete withdraw request", "error")
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
            <h1 className='flex items-center gap-1 text-xl'><DollarSign size={20} /> Withdraw Requests</h1>
            <p className='w-fit px-2 py-0.5 text-sm text-[var(--secondary)] bg-[var(--light)]/50 rounded mt-1'>Manage withdraw requests of chatters</p>

            <div className='flex justify-between items-center gap-5 mt-6'>
                <p className='w-fit text-[12px] font-bold'><span className='text-gray-500'>Admin</span> / Withdraw Requests</p>

                <div className='flex flex-1 justify-end items-center gap-2.5'>
                    <input type="text" name="searchText" id="searchText" value={searchText} placeholder='Search by withdraw id' className='w-full border border-gray-200 max-w-[280px] text-sm bg-white' onChange={e => setSearchText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                    <button className='flex items-center gap-1 text-sm text-white bg-[var(--secondary)] p-3 rounded-xl transition-all duration-150 ease-linear hover:bg-[var(--secondary)]/70' onClick={handleSearch}>Search <Search size={14} /></button>
                </div>
            </div>

            <div className="relative overflow-x-auto border border-gray-200 mt-5 rounded-xl">
                <table className="w-full text-xs text-left rtl:text-right text-gray-600">
                    <thead className="text-[10px] text-[var(--secondary)] bg-white uppercase border-b border-gray-200">
                        <tr>
                            <th scope="col" className="font-bold px-6 py-4 whitespace-nowrap">Withdraw ID</th>
                            <th scope="col" className="font-bold px-6 py-4">Chatter</th>
                            <th scope="col" className="font-bold px-6 py-4 whitespace-nowrap">Bank Name</th>
                            <th scope="col" className="font-bold px-6 py-4 whitespace-nowrap">Account Name</th>
                            <th scope="col" className="font-bold px-6 py-4 whitespace-nowrap">Account Number</th>
                            <th scope="col" className="font-bold px-6 py-4">Amount</th>
                            <th scope="col" className="font-bold px-6 py-4 whitespace-nowrap">Requested At</th>
                            <th scope="col" className="font-bold px-6 py-4 whitespace-nowrap">Completed At</th>
                            <th scope="col" className="font-bold px-6 py-4">Status</th>
                            <th scope="col" className="font-bold px-6 py-4 text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            loading ?
                                <tr className='bg-white'>
                                    <td colSpan={11} className='py-20'>
                                        <div className='flex justify-center'>
                                            <div className='flex flex-col items-center gap-5'>
                                                <span className='w-8 h-8 rounded-full border-t-2 border-[var(--secondary)] animate-spin'></span>
                                                <p>Loading...</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                :
                                withdrawRequests.length > 0 ?
                                    withdrawRequests.map((withdraw, i) => (
                                        <tr key={withdraw._id} className="bg-white border-b border-gray-200">
                                            <td className="px-6 py-4">{withdraw._id}</td>
                                            <td className="px-6 py-4">
                                                <div className='flex items-center gap-2'>
                                                    <div className='flex justify-center items-center w-12 h-12 bg-gray-100 rounded-full overflow-hidden'>
                                                        {withdraw.chatterID.avatar
                                                            ? <Image src={withdraw.chatterID.avatar} alt='avatar' className='object-cover' />
                                                            : <p className='text-gray-600'>{withdraw.chatterID.username.slice(0, 2)}</p>
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className='font-bold'>{withdraw.chatterID.username}</p>
                                                        <p>{withdraw.chatterID.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold">{withdraw.bankName}</td>
                                            <td className="px-6 py-4 font-bold">{withdraw.accountName}</td>
                                            <td className="px-6 py-4 font-bold">{withdraw.accountNumber}</td>
                                            <td className="px-6 py-4 font-bold">{withdraw.amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p>{dayjs(withdraw.createdAt).format('DD-MM-YYYY')}</p>
                                                <p>{dayjs(withdraw.createdAt).format('HH:mm A')}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {
                                                    withdraw.updatedAt !== withdraw.createdAt
                                                        ? <div>
                                                            <p>{dayjs(withdraw.updatedAt).format("DD-MM-YYYY")}</p>
                                                            <p>{dayjs(withdraw.updatedAt).format("H:mm A")}</p>
                                                        </div>
                                                        : '_'
                                                }
                                            </td>
                                            <td className="px-6 py-4 capitalize">
                                                <span className={`text-[10px] px-2 py-1 font-bold rounded ${withdraw.status === 'completed' ? 'text-[#0ec520] bg-[#d1ffd5]' : withdraw.status === 'pending' ? 'text-[#4b8fd9] bg-[#e4f1ff]' : 'text-[#d94b4b] bg-[#ffe4e4]'}`}>
                                                    {withdraw.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className='flex justify-end gap-2'>
                                                    <Pencil size={14} className='text-[16px] text-blue-500 cursor-pointer hover:text-blue-300'
                                                        onClick={() => {
                                                            setSelectedWithdrawRequest(withdraw);
                                                            setShowUpdateModal(true);
                                                        }}
                                                    />
                                                    <Trash2 size={14} className='text-red-500 cursor-pointer hover:text-red-300' onClick={() => handleDelete(withdraw._id)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                    :
                                    <tr className='bg-white'>
                                        <td colSpan={11} className='px-6 py-4 text-center text-red-500'>No withdraw request found!</td>
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
                <div className={`flex flex-col justify-between w-full max-w-[400px] h-full bg-white transition-all duration-300 ease-linear ${showUpdateModal ? 'translate-x-0' : 'translate-x-full'}`}
                    onClick={e => e.stopPropagation()}
                >
                    <div className='flex justify-between items-center p-6 border-b border-b-gray-200'>
                        <p className='font-bold'>Manage Withdraw Status</p>
                        <XIcon size={18} className='cursor-pointer hover:text-red-500' onClick={() => setShowUpdateModal(false)} />
                    </div>

                    <div className='flex-1 p-6'>
                        <label className='font-bold text-sm'>Select Status</label>
                        <select
                            name="status"
                            id="status"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className='w-full block p-2 mt-3 border border-gray-200'
                        >
                            <option value="" disabled>Select a role</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div className='flex justify-end gap-3 p-6'>
                        <button className='px-4 py-1.5 bg-gray-200 text-gray-800 rounded-lg transition-all duration-200 ease-linear hover:opacity-70' onClick={() => setShowUpdateModal(false)}>Cancel</button>
                        <button className='px-4 py-1.5 bg-[var(--secondary)] text-white rounded-lg transition-all duration-200 ease-linear hover:opacity-70' onClick={handleUpdateWithdrawStatus}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}