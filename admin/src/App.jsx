import React from 'react'
import Routes from './pages/Routes'
import { useAuthContext } from './contexts/AuthContext'
import Loader from './components/Loader'

export default function App() {
    const { loading } = useAuthContext()

    return (
        <>
            {loading ? <Loader /> : <Routes />}
        </>
    )
}