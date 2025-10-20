import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from "axios";

const initialState = { username: "", email: "", password: "", role: "user", phoneNumber: null, age: null, gender: "male" }

export default function Signup() {
    const [state, setState] = useState(initialState)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const navigate = useNavigate()

    const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))

    const handleSignup = async (e) => {
        e.preventDefault()
        setMessage("")

        const { password } = state
        if (password.length < 6) return window.toastify("Password must be at least 6 characters long!", "warning")

        if (state.role === "chatter") {
            if (!state.phoneNumber || !state.age || !state.gender) return window.toastify("Please fill all chatter fields", "warning");
        }

        setLoading(true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_HOST}/auth/signup`, state)
            setState(initialState)
            window.toastify(res.data.message, "success")
            setTimeout(() => {
                if (state.role === "user") {
                    navigate("/auth/login")
                } else {
                    navigate("/")
                }
            }, 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-full min-h-screen bg-gray-100 flex justify-center items-center p-2.5 sm:p-5'>
            <form
                className='w-full max-w-[500px] bg-white flex flex-col gap-4 p-6 rounded-xl shad'
                onSubmit={handleSignup}
            >
                <div>
                    <h1 className='text-[#333] text-2xl'>Signup</h1>
                    <p className='text-gray-700'>Create an account now</p>
                </div>

                <div>
                    <label className='text-sm font-semibold text-gray-700'>Join as</label>
                    <div className='flex gap-2 mt-1'>
                        <button type="button" className={`px-2 py-0.5 rounded text-xs border ${state.role === 'user' ? "text-[var(--secondary)] bg-[var(--light)] border-[var(--primary)]" : "text-gray-700 bg-gray-100 border-gray-200"}`}
                            onClick={() => setState(prev => ({
                                ...prev,
                                role: 'user'
                            }))}
                        >
                            User
                        </button>
                        <button type="button" className={`px-2 py-0.5 rounded text-xs border ${state.role === 'chatter' ? "text-[var(--secondary)] bg-[var(--light)] border-[var(--primary)]" : "text-gray-700 bg-gray-100 border-gray-200"}`}
                            onClick={() => setState(prev => ({
                                ...prev,
                                role: 'chatter'
                            }))}
                        >
                            Chatter
                        </button>
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-semibold text-gray-700'>Username</label>
                    <input type="text" name='username' value={state.username} placeholder="Enter username" className="w-full border border-gray-300 text-sm" onChange={handleChange} />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-semibold text-gray-700'>Email</label>
                    <input type="email" name='email' value={state.email} placeholder="Enter email" className="w-full border border-gray-300 text-sm" onChange={handleChange} />
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-semibold text-gray-700'>Password</label>
                    <input type="password" name='password' value={state.password} placeholder="Enter password" className="w-full border border-gray-300 text-sm" onChange={handleChange} />
                </div>

                {
                    state.role === 'chatter' &&
                    <>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div className='flex flex-col gap-2'>
                                <label className='text-sm font-semibold text-gray-700'>Phone Number</label>
                                <input type="number" name='phoneNumber' value={state.phoneNumber || ""} placeholder="Enter phone number" className="w-full border border-gray-300 text-sm" onChange={handleChange} />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label className='text-sm font-semibold text-gray-700'>Age</label>
                                <input type="number" name='age' value={state.age || ""} placeholder="Enter your age" className="w-full border border-gray-300 text-sm" onChange={handleChange} />
                            </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm font-semibold text-gray-700'>Gender</label>
                            <select name="gender" id="gender" value={state.gender} className='border border-gray-300 p-3 rounded-xl text-sm outline-none' onChange={handleChange}>
                                <option value="" disabled>Select your gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </>
                }

                <button
                    type="submit"
                    disabled={loading}
                    className="flex justify-center items-center gap-2 bg-[var(--secondary)] text-white p-3 mt-3 text-sm font-bold rounded-[12px] transition-all duration-150 ease-linear hover:bg-[var(--secondary)]/75"
                >
                    {loading ? "Please wait..." : "Signup"}
                </button>

                {message && <p className="text-sm text-red-500">{message}</p>}

                <p className='text-[#333] mt-2'>Already have an account? <Link to="/auth/login" className='text-[var(--secondary)]'>Login now</Link></p>
            </form>
        </div>
    )
}