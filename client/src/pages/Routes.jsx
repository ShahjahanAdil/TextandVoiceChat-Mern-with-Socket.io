import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import PrivateRoute from '../components/PrivateRoute'
import Frontend from './Frontend'
import Auth from './Auth'
import Admin from './Admin'
import Dashboard from './Dashboard'

export default function Index() {
    const { isAuthenticated } = useAuthContext()

    return (
        <Routes>
            <Route path='/*' element={<Frontend />} />
            <Route path='/auth/*' element={isAuthenticated ? <Navigate to="/" /> : <Auth />} />
            <Route path='/dashboard/*' element={<PrivateRoute Component={Dashboard} allowedRoles={["user", "chatter", "admin"]} />} />
            {/* <Route path='/user/*' element={<PrivateRoute Component={User} allowedRoles={["user", "chatter", "admin"]} />} /> */}
            {/* <Route path='/chatter/*' element={isAuthenticated && user?.role === "chatter" && user?.status === 'approved' ? <Chatter /> : <Navigate to="/auth/login" replace />} /> */}
            <Route path='/admin/*' element={<PrivateRoute Component={Admin} allowedRoles={["admin"]} />} />
        </Routes>
    )
}