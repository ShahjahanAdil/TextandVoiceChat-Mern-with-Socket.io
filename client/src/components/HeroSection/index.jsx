import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import heroImg from '../../assets/images/hero-img.jpg'

export default function HeroSection() {
    return (
        <div className='main-container flex justify-between items-center gap-10 py-18'>
            <div>
                <div className='flex gap-1 mb-2'>
                    <span className='inline-block w-2 h-2 bg-[var(--secondary)] rounded-full'></span>
                    <span className='inline-block w-2 h-2 bg-[var(--secondary)] rounded-full'></span>
                    <span className='inline-block w-2 h-2 bg-[var(--secondary)] rounded-full'></span>
                </div>
                <h1 className='text-4xl'>Let's <span className='font-bold text-[var(--hard)] italic'>Connect</span> With</h1>
                <h1 className='text-4xl'>Someone Who You Want</h1>
                <p className='w-full max-w-[550px] text-lg mt-2'>This is a platform where you can chat with your favourite ones. Start now and enjoy the unique experience with us.</p>
                <Link to="/auth/login" className='w-fit flex items-center gap-2 mt-8 px-6 py-2.5 text-[var(--secondary)] border border-[var(--secondary)] rounded-xl transition-all duration-200 ease-linear hover:bg-[var(--secondary)] hover:text-white'>Start Now <ArrowRight size={16} /></Link>
            </div>

            <div className='w-full max-w-[600px]'>
                <img src={heroImg} alt="hero-image" className='rounded-4xl shadow-lg' />
            </div>
        </div>
    )
}