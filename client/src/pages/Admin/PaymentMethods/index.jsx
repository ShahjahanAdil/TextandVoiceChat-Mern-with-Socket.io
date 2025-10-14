import React, { useEffect, useState } from 'react'
import { CreditCard, Plus, Trash2, XIcon } from 'lucide-react'
import axios from 'axios'

export default function PaymentsMethods() {
    const [form, setForm] = useState({
        bankName: "",
        accountName: "",
        accountNumber: "",
        receivingLimit: ""
    })
    const [paymentMethods, setPaymentMethods] = useState([])
    const [openModal, setOpenModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const fetchPaymentMethods = async () => {
        setLoading(true)
        axios.get(`${import.meta.env.VITE_HOST}/admin/payment-methods/all`)
            .then(res => setPaymentMethods(res.data.paymentMethods || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchPaymentMethods()
    }, [])

    const handleAddPaymentMethod = async () => {
        const { bankName, accountName, accountNumber } = form
        if (!bankName || !accountName || !accountNumber) {
            return window.toastify("Please fill all fields", "warning")
        }

        setLoading(true)
        axios.post(`${import.meta.env.VITE_HOST}/admin/payment-methods/add`, form)
            .then(res => {
                window.toastify?.(res.data.message, "success")
                setOpenModal(false)
                setForm({ bankName: "", accountName: "", accountNumber: "", receivingLimit: "" })
                fetchPaymentMethods()
            })
            .catch(err => {
                console.error(err)
                window.toastify?.("Failed to add payment method", "error")
            })
            .finally(() => setLoading(false))
    }

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this payment method?");
        if (!confirmDelete) return;

        setLoading(true)
        axios.delete(`${import.meta.env.VITE_HOST}/admin/payment-methods/delete/${id}`)
            .then(res => {
                window.toastify?.(res.data.message, "success")
                setPaymentMethods(prev => prev.filter(pm => pm._id !== id))
            })
            .catch(err => {
                console.error(err)
                window.toastify?.("Failed to delete payment method", "error")
            })
            .finally(() => setLoading(false))
    }

    return (
        <div className='admin-container'>
            <h1 className='flex items-center gap-1 text-xl'><CreditCard size={20} /> Payment Methods</h1>
            <p className='w-fit px-2 py-0.5 text-sm text-[var(--secondary)] bg-[var(--light)]/50 rounded mt-1'>Manage the payments methods and accounts to receive payments</p>

            <div className='flex justify-between items-center gap-5 mt-6'>
                <p className='w-fit text-[12px] font-bold'><span className='text-gray-500'>Admin</span> / Payment Methods</p>
                <button className='flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-sm rounded-lg' onClick={() => setOpenModal(true)}>Add Payment Method <Plus size={16} /></button>
            </div>

            <div className="relative overflow-x-auto border border-gray-200 mt-5 rounded-xl">
                <table className="w-full text-xs text-left rtl:text-right text-gray-600">
                    <thead className="text-[10px] text-[var(--secondary)] bg-white uppercase border-b border-gray-200">
                        <tr>
                            <th scope="col" className="font-bold px-6 py-4">#</th>
                            <th scope="col" className="font-bold px-6 py-4">Bank Name</th>
                            <th scope="col" className="font-bold px-6 py-4">Account Name</th>
                            <th scope="col" className="font-bold px-6 py-4">Account Number</th>
                            <th scope="col" className="font-bold px-6 py-4">Receiving Limit</th>
                            <th scope="col" className="font-bold px-6 py-4 text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            loading ?
                                <tr className='bg-white'>
                                    <td colSpan={6} className='py-20'>
                                        <div className='flex justify-center'>
                                            <div className='flex flex-col items-center gap-5'>
                                                <span className='w-8 h-8 rounded-full border-t-2 border-[var(--secondary)] animate-spin'></span>
                                                <p>Loading...</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                :
                                paymentMethods.length > 0 ?
                                    paymentMethods.map((method, i) => (
                                        <tr key={method._id} className="bg-white border-b border-gray-200">
                                            <td className="px-6 py-4">{i + 1}</td>
                                            <td scope="row" className="px-6 py-4 text-gray-900 font-bold whitespace-nowrap">
                                                {method.bankName}
                                            </td>
                                            <td scope="row" className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                {method.accountName}
                                            </td>
                                            <td scope="row" className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                {method.accountNumber}
                                            </td>
                                            <td scope="row" className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                {method.receivingLimit ? method.receivingLimit : '_'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className='flex justify-end'>
                                                    <Trash2 size={14} className='text-red-500 cursor-pointer hover:text-red-300' onClick={() => handleDelete(method._id)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                    :
                                    <tr className='bg-white'>
                                        <td colSpan={6} className='px-6 py-4 text-center text-red-500'>No payment method added yet!</td>
                                    </tr>
                        }
                    </tbody>
                </table>
            </div>

            {/* Create Payment Method Modal */}
            <div className={`fixed flex justify-end top-0 left-0 w-full h-screen bg-black/50 transition-all duration-300 ease-linear ${openModal ? "visible opacity-100" : "invisible opacity-0"}`}
                onClick={() => setOpenModal(false)}
            >
                <div className={`flex flex-col w-full max-w-[400px] bg-white h-full transition-all duration-300 ease-linear ${openModal ? "translate-x-0" : "translate-x-full"}`}
                    onClick={e => e.stopPropagation()}
                >
                    <div className='flex justify-between p-6 border-b border-gray-300'>
                        <h1>Add Payment Method</h1>
                        <XIcon size={18} className='cursor-pointer hover:text-red-500' onClick={() => setOpenModal(false)} />
                    </div>
                    <div className='flex-1 overflow-y-auto p-6 flex flex-col gap-4'>
                        {["bankName", "accountName", "accountNumber", "receivingLimit"].map((field) => (
                            <div key={field} className='flex flex-col gap-1'>
                                <label className='text-xs font-bold capitalize text-gray-900'>
                                    {field.replace(/([A-Z])/g, ' $1')}
                                </label>
                                <input
                                    type='text'
                                    name={field}
                                    value={form[field]}
                                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                    className='border border-gray-300 rounded-md px-3 py-2 text-sm'
                                />
                            </div>
                        ))}
                    </div>
                    <div className='flex justify-end gap-2 p-6 border-t border-gray-300'>
                        <button className='text-sm px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:opacity-70' onClick={() => setOpenModal(false)}>Cancel</button>
                        <button className='text-sm px-4 py-2 bg-[var(--secondary)] text-white rounded-md hover:opacity-70' disabled={loading} onClick={handleAddPaymentMethod}>
                            {loading ? "Adding..." : "Add Method"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}