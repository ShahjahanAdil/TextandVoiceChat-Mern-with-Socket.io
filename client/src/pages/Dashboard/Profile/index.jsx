import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../../contexts/AuthContext";
import { User2 } from "lucide-react";
import axios from "axios";

export default function Profile() {
    const { user, dispatch } = useAuthContext();
    const [state, setState] = useState({ ...user });
    const [pricing, setPricing] = useState({ basic: "", standard: "", gold: "", });
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setState(s => ({ ...s, [e.target.name]: e.target.value }))

    const handlePricingChange = (e) => {
        const { name, value } = e.target;
        setPricing(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (user?.plans?.length) {
            const newPricing = {};
            user.plans.forEach((plan) => {
                if (plan.title.toLowerCase() === "basic") newPricing.basic = plan.price || "";
                if (plan.title.toLowerCase() === "standard") newPricing.standard = plan.price || "";
                if (plan.title.toLowerCase() === "gold") newPricing.gold = plan.price || "";
            });
            setPricing(newPricing);
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
        if (!allowedTypes.includes(file.type)) return window.toastify?.("Only PNG, JPEG, or WEBP allowed", "error");

        setSelectedImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleCancel = () => {
        setSelectedImage(null);
        setPreview("");
    };

    const handleUpload = async () => {
        if (!selectedImage) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("avatar", selectedImage);
            formData.append("userID", state._id);

            const res = await axios.post(`${import.meta.env.VITE_HOST}/user/profile/upload-avatar`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            }
            );

            if (res.data.success) {
                const newAvatar = res.data.avatar;

                setState((prev) => ({ ...prev, avatar: newAvatar }));
                dispatch({ type: "SET_PROFILE", payload: { user: { ...user, avatar: newAvatar } }, });
                handleCancel();
                window.toastify?.("Avatar updated successfully", "success");
            }
        } catch (err) {
            console.error(err);
            window.toastify?.("Failed to upload avatar", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const payload = {
                userID: state._id,
                username: state.username,
                email: state.email,
                phoneNumber: state.phoneNumber,
                age: state.age,
                gender: state.gender,
            };

            if (user.role === "chatter") {
                payload.plans = [
                    { title: "Basic", price: pricing.basic ? Number(pricing.basic) : 0 },
                    { title: "Standard", price: pricing.standard ? Number(pricing.standard) : 0 },
                    { title: "Gold", price: pricing.gold ? Number(pricing.gold) : 0 },
                ];
            }

            const res = await axios.put(`${import.meta.env.VITE_HOST}/user/profile/update-profile`, payload);

            if (res.data.success) {
                dispatch({ type: "SET_PROFILE", payload: { user: res.data.user } });
                window.toastify?.("Profile updated successfully", "success");
            } else {
                window.toastify?.(res.data.message || "Failed to update profile", "error");
            }
        } catch (err) {
            console.error(err);
            window.toastify?.("Error updating profile", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-container p-8">
            <h1 className="text-2xl text-[var(--hard)]">Profile Settings</h1>
            <p className="w-fit px-2 py-0.5 text-sm bg-[var(--light)] text-[var(--secondary)] border border-[var(--primary)]/20 rounded-md capitalize my-2">
                {state?.role} Account
            </p>

            <div className="mt-6 w-fit flex flex-col items-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                    {preview ? (
                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    ) : state?.avatar ? (
                        <img src={state.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex justify-center items-center h-full">
                            <User2 className="text-gray-700" size={40} />
                        </div>
                    )}
                </div>

                <div className="my-3">
                    {!selectedImage ? (
                        <>
                            <label htmlFor="avatarUpload" className="px-3 py-1.5 bg-[var(--primary)] text-white text-sm rounded-md cursor-pointer hover:opacity-90">Change</label>
                            <input
                                id="avatarUpload"
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className="px-3 py-1.5 bg-[var(--primary)] text-white text-sm rounded-md hover:opacity-90"
                            >
                                {loading ? "Uploading..." : "Confirm"}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-md hover:opacity-90"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

            </div>
            <div className="w-full max-w-3xl flex flex-col gap-4 mt-6">
                <h1 className="text-lg">Personal Information</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-bold">Username</label>
                        <input type="text" name="username" id="username" value={state.username} className="text-sm mt-2 w-full border border-gray-300" onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-sm font-bold">Email</label>
                        <input type="email" name="email" id="email" value={state.email} className="text-sm mt-2 w-full border border-gray-300" onChange={handleChange} />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-bold">Phone Number</label>
                        <input type="text" name="phoneNumber" id="phoneNumber" value={state.phoneNumber || ""} className="text-sm mt-2 w-full border border-gray-300" onChange={handleChange} />
                    </div>
                    <div>
                        <label className="text-sm font-bold">Age</label>
                        <input type="number" name="age" id="age" value={state.age || ""} className="text-sm mt-2 w-full border border-gray-300" onChange={handleChange} />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-bold">Gender</label>
                    <div className="flex gap-2 mt-2">
                        <button className={`text-sm px-3 py-1 border rounded-md ${state.gender === "male" ? "bg-[var(--light)] text-[var(--hard)] border-[var(--primary)]/30" : "bg-gray-100 text-gray-800 border-gray-300"}`}
                            onClick={() => setState(prev => ({
                                ...prev, gender: "male"
                            }))}
                        >
                            Male
                        </button>
                        <button className={`text-sm px-3 py-1 border rounded-md ${state.gender === "female" ? "bg-[var(--light)] text-[var(--hard)] border-[var(--primary)]/30" : "bg-gray-100 text-gray-800 border-gray-300"}`}
                            onClick={() => setState(prev => ({
                                ...prev, gender: "female"
                            }))}
                        >
                            Female
                        </button>
                    </div>
                </div>
            </div>

            {
                user.role === "chatter" &&
                <div className="w-full max-w-3xl flex flex-col gap-4 mt-6">
                    <h1 className="text-lg">Plan Pricing</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-bold">Basic</label>
                            <input type="number" name="basic" id="basic" value={pricing.basic} className="text-sm mt-2 w-full border border-gray-300" onChange={handlePricingChange} />
                        </div>
                        <div>
                            <label className="text-sm font-bold">Standard</label>
                            <input type="number" name="standard" id="standard" value={pricing.standard} className="text-sm mt-2 w-full border border-gray-300" onChange={handlePricingChange} />
                        </div>
                        <div>
                            <label className="text-sm font-bold">Gold</label>
                            <input type="number" name="gold" id="gold" value={pricing.gold} className="text-sm mt-2 w-full border border-gray-300" onChange={handlePricingChange} />
                        </div>
                    </div>
                </div>
            }

            <div className="w-full max-w-3xl flex justify-end mt-6">
                <button className="w-fit text-sm px-6 py-2 bg-[var(--secondary)] text-white rounded-lg"
                    onClick={handleSaveChanges}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}