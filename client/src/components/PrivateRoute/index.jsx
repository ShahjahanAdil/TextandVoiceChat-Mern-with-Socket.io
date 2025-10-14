// import React from 'react'
// import { Link, Navigate, useLocation } from 'react-router-dom'
// import { useAuthContext } from '../../contexts/AuthContext';
// import { ArrowLeft } from 'lucide-react';

// export default function PrivateRoute({ Component, allowedRoles }) {

//     const { user, isAuthenticated } = useAuthContext()
//     const location = useLocation()

//     if (!isAuthenticated) return <Navigate to='/auth/login' state={{ from: location }} replace />

//     if (allowedRoles.includes(user?.role)) return <Component />

//     return (
//         <div className='h-screen flex flex-col justify-center items-center gap-4'>
//             <h1 className='text-2xl text-[#333] text-center mt-5 w-[50%]'>You don't have permission to access this page.</h1>
//             <div className='text-center mt-5'>
//                 <Link
//                     to='/'
//                     className='px-5 py-2 flex gap-3 items-center rounded-[8px] text-[#fff] bg-[var(--secondary)] decoration-0'
//                 >
//                     <ArrowLeft /> Go To Home
//                 </Link>
//             </div>
//         </div>
//     )
// }

import React from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'
import { ArrowLeft } from 'lucide-react'

export default function PrivateRoute({ Component, allowedRoles }) {
    const { user, isAuthenticated } = useAuthContext()
    const location = useLocation()
    
    if (!isAuthenticated) {
        return <Navigate to='/auth/login' state={{ from: location }} replace />
    }

    if (!allowedRoles.includes(user?.role)) {
        return (
            <div className='h-screen flex flex-col justify-center items-center gap-4'>
                <h1 className='text-2xl text-[#333] text-center mt-5 w-[50%]'>
                    You don't have permission to access this page.
                </h1>
                <div className='text-center mt-5'>
                    <Link
                        to='/'
                        className='px-5 py-2 flex gap-3 items-center rounded-[8px] text-[#fff] bg-[var(--secondary)] decoration-0'
                    >
                        <ArrowLeft /> Go To Home
                    </Link>
                </div>
            </div>
        )
    }

    if (user?.role === "chatter" && user?.status !== "approved") {
        return (
            <div className='h-screen flex flex-col justify-center items-center gap-4 text-center'>
                <h1 className='text-2xl text-[#333] font-semibold'>
                    Access Restricted
                </h1>
                <p className='text-gray-600 max-w-md'>
                    Your account status is currently <b>{user?.status}</b>.
                    Please wait for admin approval before accessing the dashboard.
                </p>
                <Link
                    to='/'
                    className='mt-5 px-5 py-2 flex gap-3 items-center rounded-[8px] text-[#fff] bg-[var(--secondary)] decoration-0'
                >
                    <ArrowLeft /> Go To Home
                </Link>
            </div>
        )
    }

    return <Component />
}