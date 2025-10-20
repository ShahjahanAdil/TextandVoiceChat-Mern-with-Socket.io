import React from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'
import { ArrowLeft, LogOut } from 'lucide-react'

export default function PrivateRoute({ Component, allowedRoles }) {
    const { user, isAuthenticated, handleLogout } = useAuthContext()
    const location = useLocation()

    if (!isAuthenticated) {
        return <Navigate to='/auth/login' state={{ from: location }} replace />
    }

    if (!allowedRoles.includes(user?.role)) {
        return (
            <div className='h-screen flex flex-col justify-center items-center gap-4'>
                <h1 className='text-2xl text-[#333] text-center mt-5 w-[50%]'>
                    🚫 Access Denied
                </h1>
                <p className='text-gray-700 max-w-md text-center'>
                    Your account role **({user?.role})** does not have permission to access the Administration Panel.
                    Please log in with an administrator account or return to the main site.
                </p>
                <div className='flex gap-4'>
                    <a
                        href='https://asdawaj.online'
                        className='px-5 py-2 flex gap-3 items-center rounded-lg text-gray-800 bg-gray-200 hover:bg-gray-300 transition-all'
                    >
                        <ArrowLeft /> Go To Main Site
                    </a>

                    {/* 💡 NEW: Logout Button */}
                    <button
                        onClick={handleLogout}
                        className='px-5 py-2 flex gap-3 items-center rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all'
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>
        )
    }

    return <Component />
}