import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Home from './Home'

export default function Frontend() {
    return (
        <>
            <Header />
            <Routes>
                <Route index element={<Home />} />
                <Route path='home' element={<Home />} />
            </Routes>
            <Footer />
        </>
    )
}