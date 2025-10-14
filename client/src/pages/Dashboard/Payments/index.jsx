import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../../contexts/AuthContext'
import { Image } from 'antd'
import { CreditCard } from 'lucide-react'
import dayjs from 'dayjs'
import axios from 'axios'

export default function Payments() {
    const { user } = useAuthContext()
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user._id) fetchSessions()
    }, [user._id])

    const fetchSessions = () => {
        setLoading(true)
        axios.get(`${import.meta.env.VITE_HOST}/payments/fetch-sessions`, { params: { id: user._id, role: user.role } })
            .then(res => {
                let data = res.data.sessions || []

                if (user.role === "chatter") data = data.filter(session => session.status === "completed")

                setSessions(data)
            })
            .catch(err => console.error("Frontend GET error: ", err))
            .finally(() => setLoading(false))
    }

    return (
        <div className='main-container px-4 py-10'>
            <h1 className='flex items-center gap-1 text-xl'><CreditCard size={20} /> Sessions History</h1>
            {
                user.role === "chatter"
                    ? <p className='w-fit px-2 py-0.5 text-sm text-[var(--secondary)] bg-[var(--light)]/50 rounded mt-1'>See the list of sessions you have done</p>
                    : <p className='w-fit px-2 py-0.5 text-sm text-[var(--secondary)] bg-[var(--light)]/50 rounded mt-1'>See the list of sessions you have purchased</p>
            }

            <p className='w-fit text-[12px] font-bold mt-4'><span className='text-gray-500'>Dashboard</span> / Sessions History</p>

            <div className="relative overflow-x-auto border border-gray-200 mt-5 rounded-xl">
                <table className="w-full text-xs text-left rtl:text-right text-gray-600">
                    <thead className="text-[10px] text-[var(--secondary)] bg-white uppercase border-b border-gray-200">
                        <tr>
                            <th scope="col" className="font-bold px-6 py-4">#</th>
                            <th scope="col" className="font-bold px-6 py-4">Session ID</th>
                            <th scope="col" className="font-bold px-6 py-4">{user.role === "chatter" ? 'User' : 'Chatter'}</th>
                            <th scope="col" className="font-bold px-6 py-4">Plan</th>
                            <th scope="col" className="font-bold px-6 py-4">Duration</th>
                            <th scope="col" className="font-bold px-6 py-4 whitespace-nowrap">Paid Amount</th>
                            {user.role !== "chatter" && <th scope="col" className="font-bold px-6 py-4 whitespace-nowrap">Transaction ID</th>}
                            {user.role !== "chatter" && <th scope="col" className="font-bold px-6 py-4 whitespace-nowrap">Payment Status</th>}
                            <th scope="col" className="font-bold px-6 py-4 whitespace-nowrap">Start Time</th>
                            <th scope="col" className="font-bold px-6 py-4 whitespace-nowrap">End Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            loading ?
                                <tr className='bg-white'>
                                    <td colSpan={6} className='py-20'>
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
                                    sessions.map((session, i) => {
                                        const counterpart = user.role === "chatter" ? session.userID : session.chatterID;

                                        return (
                                            <tr key={session._id} className="bg-white border-b border-gray-200">
                                                <td className="px-6 py-4">{i + 1}</td>
                                                <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                    {session._id}
                                                </td>
                                                <td scope="row" className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                    <div className='flex items-center gap-2'>
                                                        <div className='flex justify-center items-center w-12 h-12 bg-gray-100 rounded-full'>
                                                            {counterpart?.avatar ?
                                                                <Image src={counterpart?.avatar} alt='avatar' style={{ width: '48px', height: '48px', objectFit: 'cover' }} className='rounded-full overflow-hidden' />
                                                                :
                                                                <p className='text-gray-700 font-bold uppercase'>{counterpart?.username?.slice(0, 2)}</p>
                                                            }
                                                        </div>
                                                        <div>
                                                            <p className='font-bold'>{counterpart?.username}</p>
                                                            <p className='text-[10px] capitalize'>Gender: {counterpart?.gender || 'N/A'}</p>
                                                            <p className='text-[10px] capitalize'>Age: {counterpart?.age || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td scope="row" className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                    {session.plan.title}
                                                </td>
                                                <td scope="row" className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                    {session.plan.description.replace("chat", "")}
                                                </td>
                                                <td scope="row" className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                    {session.amountPaid} PKR
                                                </td>
                                                {user.role !== "chatter" &&
                                                    <td scope="row" className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                        {session.transactionID}
                                                    </td>
                                                }
                                                {user.role !== "chatter" &&
                                                    <td scope="row" className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                        <p className='capitalize'>{session.status}</p>
                                                    </td>
                                                }
                                                <td scope="row" className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                    <p>{dayjs(session.startTime).format("DD-MM-YYYY")}</p>
                                                    <p>{dayjs(session.startTime).format("h:mm A")}</p>
                                                </td>
                                                <td scope="row" className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                    <p>{dayjs(session.endTime).format("DD-MM-YYYY")}</p>
                                                    <p>{dayjs(session.endTime).format("h:mm A")}</p>
                                                </td>
                                            </tr>
                                        )
                                    })
                                    :
                                    <tr className='bg-white'>
                                        <td colSpan={12} className='px-6 py-4 text-center text-red-500'>No session done yet!</td>
                                    </tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}