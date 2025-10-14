import React, { useEffect, useState } from 'react'
import { Image } from 'antd'
import { Pencil, Search, Trash2, User2, UserCheck, XIcon } from 'lucide-react'
import dayjs from 'dayjs'
import axios from 'axios'

export default function AccountRequests() {
    const [users, setUsers] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchText, setSearchText] = useState("")
    const [activeSearch, setActiveSearch] = useState("")
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (activeSearch) {
            fetchSearchedUsers(activeSearch, page)
        } else {
            fetchUsers(page)
        }
    }, [page, activeSearch])

    const fetchUsers = (page) => {
        setLoading(true)
        axios.get(`${import.meta.env.VITE_HOST}/admin/account-requests/all?page=${page}`)
            .then(res => {
                const { status, data } = res
                if (status === 200) {
                    setUsers(data?.users || [])
                    setTotalPages(Math.ceil(data?.totalUsers / 20))
                }
            })
            .catch(err => console.error('Frontend GET error', err.message))
            .finally(() => setLoading(false))
    }

    const fetchSearchedUsers = (text, page) => {
        setLoading(true)
        axios.get(`${import.meta.env.VITE_HOST}/admin/account-requests/search?searchText=${text}&page=${page}`)
            .then(res => {
                if (res.status === 200) {
                    setUsers(res.data?.searchedUsers || [])
                    setTotalPages(Math.ceil(res.data?.totalSearchedUsers / 20))
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

    const handleUpdateUser = async () => {
        if (!newStatus) return alert("Please select a status");

        setLoading(true);
        try {
            const res = await axios.put(`${import.meta.env.VITE_HOST}/admin/account-requests/update-status/${selectedUser._id}`, { status: newStatus });
            if (res.status === 202) {
                setShowUpdateModal(false);
                setSelectedUser(null);
                window.toastify("User status updated!", "success");

                if (activeSearch) {
                    fetchSearchedUsers(activeSearch, page);
                } else {
                    fetchUsers(page);
                }
            }
        } catch (err) {
            console.error("Frontend UPDATE error", err.message);
            window.toastify(err.response.data.message || "Something went wrong! Please try again.", "error")
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        const confirmDelete = confirm("Are you sure you want to delete this user?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const res = await axios.delete(`${import.meta.env.VITE_HOST}/admin/account-requests/delete/${id}`);
            if (res.status === 203) {
                window.toastify("User deleted successfully!", "success")
                if (activeSearch) {
                    fetchSearchedUsers(activeSearch, page);
                } else {
                    fetchUsers(page);
                }
            }
        } catch (err) {
            console.error("Frontend DELETE error", err.message);
            window.toastify(err.response.data.message || "Something went wrong! Please try again.", "error")
        } finally {
            setLoading(false);
        }
    };

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
            <h1 className='flex items-center gap-1 text-xl'><UserCheck size={20} /> Account Requests</h1>
            <p className='w-fit px-2 py-0.5 text-sm text-[var(--secondary)] bg-[var(--light)]/50 rounded mt-1'>See the chatters account requests here and manage there approval</p>

            <div className='flex justify-between items-center gap-5 mt-6'>
                <p className='w-fit text-[12px] font-bold'><span className='text-gray-500'>Admin</span> / Users</p>

                <div className='flex flex-1 justify-end items-center gap-2.5'>
                    <input type="text" name="searchText" id="searchText" value={searchText} placeholder='Search by username or email' className='w-full border border-gray-200 max-w-[280px] text-sm bg-white' onChange={e => setSearchText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                    <button className='flex items-center gap-1 text-sm text-white bg-[var(--secondary)] p-3 rounded-xl transition-all duration-150 ease-linear hover:bg-[var(--secondary)]/70' onClick={handleSearch}>Search <Search size={14} /></button>
                </div>
            </div>

            <div className="relative overflow-x-auto border border-gray-200 mt-5 rounded-xl">
                <table className="w-full text-xs text-left rtl:text-right text-gray-600">
                    <thead className="text-[10px] text-[var(--secondary)] bg-white uppercase border-b border-gray-200">
                        <tr>
                            <th scope="col" className="font-bold px-6 py-4">#</th>
                            <th scope="col" className="font-bold px-6 py-4">User</th>
                            <th scope="col" className="font-bold px-6 py-4">Gender</th>
                            <th scope="col" className="font-bold px-6 py-4">Age</th>
                            <th scope="col" className="font-bold px-6 py-4">Phone Number</th>
                            <th scope="col" className="font-bold px-6 py-4">Reg. Date</th>
                            <th scope="col" className="font-bold px-6 py-4">Status</th>
                            <th scope="col" className="font-bold px-6 py-4 text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            loading ?
                                <tr className='bg-white'>
                                    <td colSpan={8} className='py-20'>
                                        <div className='flex justify-center'>
                                            <div className='flex flex-col items-center gap-5'>
                                                <span className='w-8 h-8 rounded-full border-t-2 border-[var(--secondary)] animate-spin'></span>
                                                <p>Loading...</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                :
                                users.length > 0 ?
                                    users.map((user, i) => (
                                        <tr key={user._id} className="bg-white border-b border-gray-200">
                                            <td className="px-6 py-4">{i + 1}</td>
                                            <td scope="row" className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                <div className='items-center flex gap-2'>
                                                    <div className='flex justify-center items-center w-10 h-10 bg-gray-100 rounded-full overflow-hidden'>
                                                        {
                                                            user.avatar ?
                                                                <Image src={user.avatar} className='w-full h-full object-cover' />
                                                                :
                                                                <User2 className='text-gray-500' />
                                                        }
                                                    </div>
                                                    <div className='flex flex-col gap-1'>
                                                        <p className='text-gray-900 font-bold'>{user.username}</p>
                                                        <p className='text-gray-600'>{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 capitalize">{user.gender}</td>
                                            <td className="px-6 py-4 capitalize">{user.age}</td>
                                            <td className="px-6 py-4 capitalize">{user.phoneNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{dayjs(user.createdAt).format('DD-MM-YYYY HH:mm')}</td>
                                            <td className="px-6 py-4 capitalize">
                                                <span className={`text-[10px] px-2 py-1 font-bold rounded ${user.status === 'approved' ? 'text-[#0ec520] bg-[#d1ffd5]' : user.status === 'pending' ? 'text-[#4b8fd9] bg-[#e4f1ff]' : 'text-[#d94b4b] bg-[#ffe4e4]'}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className='flex justify-end gap-2'>
                                                    <Pencil size={14} className='text-[16px] text-blue-500 cursor-pointer hover:text-blue-300'
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setNewStatus(user.status);
                                                            setShowUpdateModal(true);
                                                        }}
                                                    />
                                                    <Trash2 size={14} className='text-red-500 cursor-pointer hover:text-red-300' onClick={() => handleDeleteUser(user._id)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                    :
                                    <tr className='bg-white'>
                                        <td colSpan={5} className='px-6 py-4 text-center text-red-500'>No user found!</td>
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
                        <p className='font-bold'>Manage User</p>
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
                            <option value="" disabled>Select a status</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                            <option value="banned">Banned</option>
                        </select>
                    </div>

                    <div className='flex justify-end gap-3 p-6'>
                        <button className='px-4 py-1.5 bg-gray-200 text-gray-800 rounded-lg transition-all duration-200 ease-linear hover:opacity-70' onClick={() => setShowUpdateModal(false)}>Cancel</button>
                        <button className='px-4 py-1.5 bg-[var(--secondary)] text-white rounded-lg transition-all duration-200 ease-linear hover:opacity-70' onClick={handleUpdateUser}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}