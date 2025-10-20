import React, { useEffect, useState } from 'react'
import { Timer, XIcon } from 'lucide-react'
import axios from 'axios'

const initialState = {
    userID: "", chatterID: "", plan: {}, transactionID: "", bankName: "", accountName: "", accountNumber: "", amountPaid: 0
}

export default function PaymentWindow({ selectedPlan, setSelectedPlan, user, selectedChatter }) {
    const [state, setState] = useState(initialState)
    const [isBusy, setIsBusy] = useState(false)
    const [remainingMinutes, setRemainingMinutes] = useState(null)
    const [paymentMethods, setPaymentMethods] = useState([])
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
    const [screenshot, setScreenshot] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const isChatter = user?.role === "chatter"
        setState(prev => ({
            ...prev,
            userID: isChatter ? selectedChatter._id : user._id,
            chatterID: isChatter ? user._id : selectedChatter._id,
            plan: selectedPlan,
            amountPaid: selectedPlan.price
        }))
    }, [])

    useEffect(() => {
        const isChatter = user?.role === "chatter"
        if (isChatter) return

        setLoading(true)
        axios.get(`${import.meta.env.VITE_HOST}/chatter/busy/check?chatterID=${selectedChatter._id}`)
            .then(res => {
                setIsBusy(res.data.isBusy)
                if (res.data.isBusy) {
                    setRemainingMinutes(res.data.remainingMinutes);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        setLoading(true)
        axios.get(`${import.meta.env.VITE_HOST}/admin/payment-methods/all`)
            .then(res => {
                setPaymentMethods(res.data.paymentMethods)
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const handleSelectPaymentMethod = (method) => {
        setSelectedPaymentMethod(method)
        setState(prev => ({
            ...prev,
            bankName: method.bankName,
            accountName: method.accountName,
            accountNumber: method.accountNumber,
        }))
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
        if (!allowedTypes.includes(file.type)) return window.toastify?.("Only PNG, JPEG, or WEBP allowed", "error");


        setScreenshot(file);
    };

    const handleSubmit = async () => {
        const { userID, chatterID, plan, transactionID, bankName, accountName, accountNumber, amountPaid } = state

        if (!selectedPlan) return window.toastify("Please select a plan", "warning")
        if (!selectedPaymentMethod) return window.toastify("Please select a payment method", "warning")
        if (!transactionID.trim()) return window.toastify("Please enter transaction ID", "warning")
        if (!screenshot) return window.toastify("Please upload screenshot of payment", "warning")

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("userID", userID);
            formData.append("chatterID", chatterID);
            formData.append("plan", JSON.stringify(plan));
            formData.append("transactionID", transactionID);
            formData.append("transactionSS", screenshot);
            formData.append("bankName", bankName);
            formData.append("accountName", accountName);
            formData.append("accountNumber", accountNumber);
            formData.append("amountPaid", amountPaid);

            const res = await axios.post(`${import.meta.env.VITE_HOST}/user/purchase/plan`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            }
            );

            if (res.data.success) {
                window.toastify(res.data.message, "success");
                setSelectedPlan(null)
                setSelectedPaymentMethod(null)
                setScreenshot(null)
            }
        } catch (err) {
            window.toastify(err?.response?.data?.message, "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='fixed inset-0 bg-black/50 p-8 z-99 overflow-y-auto'
            onClick={() => setSelectedPlan(null)}
        >
            <div className='w-full max-w-4xl mx-auto min-h-full bg-white p-6 rounded-2xl'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='flex items-center justify-between'>
                    <h1 className='text-lg text-gray-800'>Continue Payment</h1>
                    <XIcon size={18} className='text-gray-800 cursor-pointer hover:text-red-500' onClick={() => setSelectedPlan(null)} />
                </div>

                {
                    loading ?
                        <div className='flex flex-col justify-center items-center py-30'>
                            <div className='w-10 h-10 border-t-2 border-[var(--primary)] rounded-full animate-spin'></div>
                        </div>
                        : isBusy ?
                            <div className='flex flex-col justify-center items-center py-20'>
                                <p className='text-lg text-red-500 font-semibold'>
                                    The chatter is busy right now.
                                </p>
                                <p className='text-sm text-gray-600 mt-2'>
                                    You can buy the plan after {remainingMinutes} minutes.
                                </p>
                            </div>
                            :
                            <>
                                <p className='text-gray-800 font-bold mt-8 mb-4'>Selected Plan</p>
                                <div className='flex justify-between items-center gap-12 w-fit bg-[var(--light)] p-6 rounded-2xl'>
                                    <div>
                                        <p className='text-[var(--hard)]'>{selectedPlan.title}</p>
                                        <p className='text-2xl text-[var(--dark)] font-bold'>{selectedPlan.price} PKR</p>
                                    </div>
                                    <div className='flex flex-col items-center gap-1'>
                                        <div className='flex justify-center items-center w-8 h-8 bg-[var(--primary)] rounded-full'>
                                            <Timer className='text-white' />
                                        </div>
                                        <p className='text-xs text-gray-600'>{selectedPlan.duration} Mins</p>
                                    </div>
                                </div>

                                <p className='text-gray-800 font-bold mt-8 mb-4'>Select a Payment Method</p>
                                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                                    {
                                        paymentMethods.length > 0 ?
                                            paymentMethods.map(method => (
                                                <div key={method._id} className={`p-6 cursor-pointer rounded-2xl ${method._id === selectedPaymentMethod?._id ? "bg-blue-50 border border-blue-200" : "bg-gray-100"}`}
                                                    onClick={() => handleSelectPaymentMethod(method)}
                                                >
                                                    <div className='flex flex-col gap-1'>
                                                        <p className='text-sm text-gray-700'><span className='font-bold'>Bank Name:</span> {method.bankName}</p>
                                                        <p className='text-sm text-gray-700'><span className='font-bold'>Account Name:</span> {method.accountName}</p>
                                                        <p className='text-sm text-gray-700'><span className='font-bold'>Account Number:</span> {method.accountNumber}</p>
                                                    </div>
                                                </div>
                                            ))
                                            :
                                            <div className='text-sm text-red-500'>No payment method present right now!</div>
                                    }
                                </div>

                                {
                                    selectedPaymentMethod &&
                                    <>
                                        <p className='text-gray-800 font-bold mt-8'>Make Transaction</p>
                                        <p className='w-fit bg-yellow-50 text-yellow-600 text-sm mt-1 mb-4'>Send amount to selected account and fill all fields below</p>

                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                            <div>
                                                <label className='text-sm text-gray-800 font-bold'>Transaction ID</label>
                                                <input type="text" name="transactionID" id="transactionID" placeholder='Enter Transaction ID' className='block w-full border border-gray-300 mt-2'
                                                    onChange={(e) => setState(prev => ({
                                                        ...prev,
                                                        transactionID: e.target.value
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <label className='text-sm text-gray-800 font-bold'>Screenshot</label>
                                                <input type="file" name="transactionSS" id="transactionSS" className='block w-full border border-gray-300 mt-2'
                                                    accept="image/png, image/jpeg, image/webp"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                        </div>

                                        <div className='flex justify-end gap-2'>
                                            <button className='bg-gray-200 text-gray-700 px-6 py-2 rounded-lg mt-6 transition-all duration-300 ease-out hover:opacity-70'
                                                onClick={() => setSelectedPlan(null)}
                                            >
                                                Cancel
                                            </button>
                                            <button className='bg-[var(--secondary)] text-white px-6 py-2 rounded-lg mt-6 transition-all duration-300 ease-out hover:opacity-70'
                                                disabled={loading}
                                                onClick={handleSubmit}
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </>
                                }
                            </>
                }
            </div>
        </div >
    )
}