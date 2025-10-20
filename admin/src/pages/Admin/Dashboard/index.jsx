import React from 'react'
import { ChartPie } from 'lucide-react'

export default function Dashboard() {
    return (
        <div className='admin-container'>
            <h1 className='flex items-center gap-1 text-xl'><ChartPie size={20} /> Dashboard</h1>
            <p className='w-fit px-2 py-0.5 text-sm text-[var(--secondary)] bg-[var(--light)]/50 rounded mt-1'>Manage your platform data here</p>
        </div>
    )
}