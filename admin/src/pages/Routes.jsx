import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import PrivateRoute from '../components/PrivateRoute'
import Auth from './Auth'
import Admin from './Admin'

export default function Index() {
    const { isAuthenticated, user } = useAuthContext()

    return (
        <Routes>
            <Route path='/' element={
                !isAuthenticated
                    ? <Auth />
                    : (user?.role === "admin"
                        ? <Navigate to="/admin/dashboard" replace />
                        : <PrivateRoute Component={Admin} allowedRoles={["admin"]} />
                    )
            } />
            <Route path='/auth/*' element={isAuthenticated ? <Navigate to="/" /> : <Auth />} />
            <Route path='/admin/*' element={<PrivateRoute Component={Admin} allowedRoles={["admin"]} />} />
            <Route path='*' element={
                isAuthenticated
                    ? <Navigate to="/admin/dashboard" replace />
                    : <Navigate to="/" replace />
            } />
        </Routes>
    )
}