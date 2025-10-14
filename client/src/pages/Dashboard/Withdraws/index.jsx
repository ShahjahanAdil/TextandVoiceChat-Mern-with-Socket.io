import React, { useEffect, useState } from 'react'
import { CircleDollarSign, DollarSign, Timer } from 'lucide-react'
import { useAuthContext } from '../../../contexts/AuthContext';
import dayjs from 'dayjs';
import axios from 'axios';

const initialState = { availableBalance: 0, pendingWithdraw: 0, totalWithdrawn: 0 }
const initialWithdrawState = { bankName: "", accountName: "", accountNumber: "", amount: 0 }

export default function Withdraws() {
    const { user } = useAuthContext();
    const [state, setState] = useState(initialState)
    const [withdraw, setWithdraw] = useState(initialWithdrawState)
    const [withdraws, setWithdraws] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [requestingWithdraw, setRequestingWithdraw] = useState(false)

    const handleChange = e => setWithdraw(s => ({ ...s, [e.target.name]: e.target.value }))

    useEffect(() => {
        if (user._id) {
            setState(prev => ({
                ...prev,
                availableBalance: user.availableBalance,
                pendingWithdraw: user.pendingWithdraw,
                totalWithdrawn: user.totalWithdrawn
            }))
        }
    }, [user])

    useEffect(() => {
        if (user._id) fetchWithdraws(page)
    }, [user, page])

    const fetchWithdraws = (page) => {
        setLoading(true)
        axios.get(`${import.meta.env.VITE_HOST}/chatter/withdraws/all?chatterID=${user._id}&&page=${page}`)
            .then(res => {
                const { status, data } = res
                if (status === 200) {
                    setWithdraws(data?.withdraws || [])
                    setTotalPages(Math.ceil(data?.totalWithdraws / 20))
                }
            })
            .catch(err => console.error('Frontend GET error', err.message))
            .finally(() => setLoading(false))
    }

    const handleRequestWithdraw = () => {
        const isMonday = dayjs().day() === 1;
        if (!isMonday) return window.toastify("Withdraw requests are allowed on Monday only", "info");

        if (!withdraw.bankName || !withdraw.accountName || !withdraw.accountNumber) {
            return window.toastify("Please fill all fields to request withdraw", "warning")
        }

        if (state.availableBalance <= 0) return window.toastify("Insufficient balance!", "error")

        const newWithdraw = { ...withdraw, amount: state.availableBalance }

        setRequestingWithdraw(true)
        axios.post(`${import.meta.env.VITE_HOST}/chatter/withdraws/create?chatterID=${user._id}`, newWithdraw)
            .then(res => {
                const { status, data } = res
                if (status === 201) {
                    setState(prev => ({
                        ...prev,
                        availableBalance: prev.availableBalance - newWithdraw.amount,
                        pendingWithdraw: prev.pendingWithdraw + newWithdraw.amount,
                    }))
                    setWithdraws(prev => ([data.withdraw, ...prev]))
                    setWithdraw(initialWithdrawState)
                }
            })
            .catch(err => {
                window.toastify("Something went wrong! Please try again.", "error")
                console.error('Frontend GET error', err.message)
            })
            .finally(() => setRequestingWithdraw(false))
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
        <div className='main-container px-4 py-10'>
            <h1 className='flex items-center gap-1 text-xl'><DollarSign size={20} /> Withdraw Amount</h1>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-6'>
                <div className='flex flex-col items-center p-6 bg-white border border-gray-200 rounded-2xl'>
                    <div className='flex justify-center items-center w-10 h-10 bg-blue-400 rounded-full mb-3'>
                        <CircleDollarSign className='text-white' />
                    </div>
                    <p className='text-gray-800'>Available Balance</p>
                    <p className='text-xl font-bold'>{state.availableBalance} PKR</p>
                </div>
                <div className='flex flex-col items-center p-6 bg-white border border-gray-200 rounded-2xl'>
                    <div className='flex justify-center items-center w-10 h-10 bg-yellow-400 rounded-full mb-3'>
                        <Timer className='text-white' />
                    </div>
                    <p className='text-gray-800'>Pending Withdraw</p>
                    <p className='text-xl font-bold'>{state.pendingWithdraw} PKR</p>
                </div>
                <div className='flex flex-col items-center p-6 bg-white border border-gray-200 rounded-2xl'>
                    <div className='flex justify-center items-center w-10 h-10 bg-[var(--primary)] rounded-full mb-3'>
                        <CircleDollarSign className='text-white' />
                    </div>
                    <p className='text-gray-800'>Total Withdrawn</p>
                    <p className='text-xl font-bold'>{state.totalWithdrawn} PKR</p>
                </div>
            </div>

            <p className='w-fit px-2 py-1 text-xs bg-amber-100 text-amber-600 rounded mb-4'>*Fill these fields before requesting withdraw to receive payment</p>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
                <div>
                    <label className='block text-sm font-bold mb-2'>Bank Name</label>
                    <input type="text" name="bankName" id="bankName" value={withdraw.bankName} placeholder='Enter bank name' className='w-full text-sm border border-gray-200' onChange={handleChange} />
                </div>
                <div>
                    <label className='block text-sm font-bold mb-2'>Account Name</label>
                    <input type="text" name="accountName" id="accountName" value={withdraw.accountName} placeholder='Enter account name' className='w-full text-sm border border-gray-200' onChange={handleChange} />
                </div>
                <div>
                    <label className='block text-sm font-bold mb-2'>Account Number</label>
                    <input type="text" name="accountNumber" id="accountNumber" value={withdraw.accountNumber} placeholder='Enter account number' className='w-full text-sm border border-gray-200' onChange={handleChange} />
                </div>
            </div>

            <div className='mb-8 pb-8 border-b border-gray-300'>
                <button className='w-full p-2.5 bg-[#24c94d] text-white rounded-lg cursor-pointer transition-all duration-200 ease-out hover:opacity-70 disabled:opacity-50'
                    disabled={requestingWithdraw}
                    onClick={handleRequestWithdraw}
                >
                    {!requestingWithdraw
                        ? 'Request Withdraw'
                        : 'Requesting...'
                    }
                </button>
            </div>

            <div>
                <h1 className='flex items-center gap-1 text-xl'>Withdraw History</h1>

                <div className="relative overflow-x-auto border border-gray-200 mt-5 rounded-xl">
                    <table className="w-full text-xs text-left rtl:text-right text-gray-600">
                        <thead className="text-[10px] text-[var(--secondary)] bg-white uppercase border-b border-gray-200">
                            <tr>
                                <th scope="col" className="font-bold px-6 py-4">Withdraw ID</th>
                                <th scope="col" className="font-bold px-6 py-4">Bank Name</th>
                                <th scope="col" className="font-bold px-6 py-4">Account Name</th>
                                <th scope="col" className="font-bold px-6 py-4">Account Number</th>
                                <th scope="col" className="font-bold px-6 py-4">Amount</th>
                                <th scope="col" className="font-bold px-6 py-4">Requested At</th>
                                <th scope="col" className="font-bold px-6 py-4">Completed At</th>
                                <th scope="col" className="font-bold px-6 py-4">Status</th>
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
                                    withdraws.length > 0 ?
                                        withdraws.map((withdraw) => (
                                            <tr key={withdraw._id} className="bg-white border-b border-gray-200">
                                                <td className="px-6 py-4">{withdraw._id}</td>
                                                <td className="px-6 py-4 font-bold">{withdraw.bankName}</td>
                                                <td className="px-6 py-4 font-bold">{withdraw.accountName}</td>
                                                <td className="px-6 py-4 font-bold">{withdraw.accountNumber}</td>
                                                <td className="px-6 py-4">{withdraw.amount} PKR</td>
                                                <td className="px-6 py-4">
                                                    <p>{dayjs(withdraw.createdAt).format("DD-MM-YYYY")}</p>
                                                    <p>{dayjs(withdraw.createdAt).format("H:mm A")}</p>
                                                </td>
                                                <td className="px-6 py-4">
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
                                            </tr>
                                        ))
                                        :
                                        <tr className='bg-white'>
                                            <td colSpan={7} className='px-6 py-4 text-center text-red-500'>No withdraw found!</td>
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
            </div>
        </div>
    )
}