import React, { useEffect, useState } from 'react'
import './admin.css'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'
import Dashboard from './Dashboard'
import { ArrowRight, ChartPie, CreditCard, DollarSign, LogOut, MessageSquare, User2, UserCheck, Users2 } from 'lucide-react'
import Users from './Users'
import AccountRequests from './AccountRequests'
import PaymentsMethods from './PaymentMethods'
import SessionRequests from './SessionRequests'
import WithdrawRequests from './WithdrawRequests'

export default function Admin() {
    const { user, handleLogout } = useAuthContext()
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (window.innerWidth <= 991) {
            setOpen(true)
        }
    }, [])

    return (
        <>
            <div className='flex'>
                <div className={`sider ${open ? 'sider-open' : 'sider-closed'}`}>
                    <h6 className={`text-xl text-white px-5 py-4 cursor-pointer ${open && '!hidden'}`} onClick={() => navigate('/')}>TapChat</h6>

                    <div className={`sider-links flex flex-col flex-1 overflow-y-auto justify-between ${open && 'items-center'}`}>
                        <div className={`flex flex-col overflow-y-auto mt-5 ${open && 'mt-15'}`}>
                            <NavLink to="/admin/dashboard" className={({ isActive }) => `sider-link hover:bg-[#fff]/20 ${open && '!p-[12px] w-fit'} ${isActive && 'sider-link-active'}`}><ChartPie size={16} /> <span className={`sider-text ${open && '!hidden'}`}>Dashboard</span></NavLink>
                            <NavLink to="/admin/users" className={({ isActive }) => `sider-link hover:bg-[#fff]/20 ${open && '!p-[12px] w-fit'} ${isActive && 'sider-link-active'}`}><Users2 size={16} /> <span className={`sider-text ${open && '!hidden'}`}>Users</span></NavLink>
                            <NavLink to="/admin/account-requests" className={({ isActive }) => `sider-link hover:bg-[#fff]/20 ${open && '!p-[12px] w-fit'} ${isActive && 'sider-link-active'}`}><UserCheck size={16} /> <span className={`sider-text ${open && '!hidden'}`}>Account Requests</span></NavLink>
                            <NavLink to="/admin/session-requests" className={({ isActive }) => `sider-link hover:bg-[#fff]/20 ${open && '!p-[12px] w-fit'} ${isActive && 'sider-link-active'}`}><MessageSquare size={16} /> <span className={`sider-text ${open && '!hidden'}`}>Session Requests</span></NavLink>
                            <NavLink to="/admin/payment-methods" className={({ isActive }) => `sider-link hover:bg-[#fff]/20 ${open && '!p-[12px] w-fit'} ${isActive && 'sider-link-active'}`}><CreditCard size={16} /> <span className={`sider-text ${open && '!hidden'}`}>Payment Methods</span></NavLink>
                            <NavLink to="/admin/withdraw-requests" className={({ isActive }) => `sider-link hover:bg-[#fff]/20 ${open && '!p-[12px] w-fit'} ${isActive && 'sider-link-active'}`}><DollarSign size={16} /> <span className={`sider-text ${open && '!hidden'}`}>Withdraw Requests</span></NavLink>
                        </div>

                        <div className='pt-5'>
                            <div className='flex gap-2 items-center p-2'>
                                <User2 className='bg-[#e8e8e8] p-2 w-8 h-8 rounded-full' />
                                <div className={`${open && '!hidden'}`}>
                                    <div className='text-white'>{user?.username}</div>
                                    <div className='text-white text-[12px]'>{user?.email}</div>
                                </div>
                            </div>

                            <div className='flex justify-center py-3.5'>
                                <button className='text-sm flex gap-2 items-center text-white'><LogOut size={16} /> <span className={`sider-text ${open && '!hidden'}`} onClick={() => handleLogout()}>Logout</span></button>
                            </div>
                        </div>
                    </div>

                    <div className={`sider-arrow bg-[var(--secondary)]/75 !text-white cursor-pointer p-3 rounded-full transition-all duration-200 ease-out ${open ? 'rotate-0' : 'rotate-180'}`} onClick={() => setOpen(prev => !prev)}>
                        <ArrowRight />
                    </div>
                </div>

                <div className={`content overflow-x-hidden ${open ? '!ml-[50px] md:!ml-[65px]' : '!ml-[220px]'}`}>
                    <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path='/dashboard' element={<Dashboard />} />
                        <Route path='/users' element={<Users />} />
                        <Route path='/account-requests' element={<AccountRequests />} />
                        <Route path='/session-requests' element={<SessionRequests />} />
                        <Route path='/payment-methods' element={<PaymentsMethods />} />
                        <Route path='/withdraw-requests' element={<WithdrawRequests />} />
                    </Routes>
                </div>
            </div>
        </>
    )
}