import React from 'react'
import { useAuthContext } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'
import logo from '../../assets/images/asdawaj-logo.jpeg'
import { LogIn, MessageCircle } from 'lucide-react'

export default function Header() {
    const { user, isAuthenticated } = useAuthContext()

    return (
        <header className='p-3 sm:p-6'>
            <div className='main-container flex justify-between items-center gap-5 px-6 py-2 border border-gray-300 rounded-full shadow-md'>
                {/* <h1 className='text-xl text-[var(--hard)]'>TapChat</h1> */}
                <div>
                    <img src={logo} alt="logo" className='w-30 rounded-2xl' />
                </div>

                <div className='flex flex-wrap items-center gap-6'>
                    <Link className='text-sm transition-all duration-200 ease-linear hover:text-[var(--hard)]'>Contact</Link>
                    <Link className='text-sm transition-all duration-200 ease-linear hover:text-[var(--hard)]'>About</Link>
                    {
                        user?.role === "admin" &&
                        <Link to="/admin/dashboard" className='text-sm transition-all duration-200 ease-linear hover:text-[var(--hard)]'>Admin</Link>
                    }
                    {
                        !isAuthenticated ?
                            <>
                                <Link to="/auth/signup" className='text-sm transition-all duration-200 ease-linear hover:text-[var(--hard)]'>Signup</Link>
                                <Link to="/auth/login" className='flex items-center gap-1 text-sm transition-all duration-200 ease-linear hover:text-[var(--hard)]'>Login <LogIn size={14} /></Link>
                            </>
                            :
                            <Link to="/dashboard" className='flex items-center gap-1.5 text-sm bg-[var(--primary)] text-white px-3 py-2 rounded-full transition-all duration-200 ease-linear hover:bg-[var(--secondary)]'><MessageCircle size={14} /> Open Chat</Link>
                    }
                </div>
            </div>
        </header>
    )
}