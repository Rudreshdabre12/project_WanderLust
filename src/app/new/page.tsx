"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";

export default function AddListingForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image: {
            url: "",
            filename: "listingimage",
        },
        price: 0,
        location: "",
        country: ""
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            image: {
                ...prevData.image,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userDataResponse = await axios.post("/api/users/getTokenData");
            const userId = userDataResponse?.data?.data?.id;

            if (!userId) {
                throw new Error("User ID not found");
            }

            const payload = {
                ...formData,
                user: {
                    data: {
                        data: {
                            id: userId
                        }
                    }
                }
            };

            const response = await axios.post("/api/listings/new", payload);
            setSuccess("Listing added successfully!");
            setFormData({
                title: "",
                description: "",
                image: { url: "", filename: "listingimage" },
                price: 0,
                location: "",
                country: ""
            });
            router.push("/home");
        } catch (err: any) {
            setError("Error adding listing: " + (err.response?.data?.error || err.message));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(to right, #ff512f, #dd2476)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '40px 20px',
                boxSizing: 'border-box'
            }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                maxWidth: '600px',
                marginBottom: '20px'
            }}>
                <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '24px' }}>Create Listing</h2>
                <button
                    onClick={() => router.push('/home')}
                    style={{
                        backgroundColor: '#fff',
                        color: '#dd2476',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s ease'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Home
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                    maxWidth: '600px',
                    width: '100%',
                    background: '#fff',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
                    color: '#333'
                }}
            >
                <h1 style={{
                    textAlign: 'center',
                    marginBottom: '25px',
                    fontSize: '28px',
                    color: '#dd2476',
                    letterSpacing: '1px',
                }}>Add New Listing</h1>

                {success && <p style={{ color: "green", textAlign: 'center' }}>{success}</p>}
                {error && <p style={{ color: "red", textAlign: 'center' }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[
                        { label: "Title", name: "title", type: "text", placeholder: "Enter the title of the listing" },
                        { label: "Image URL", name: "url", type: "text", placeholder: "Enter the image URL", isImage: true },
                        { label: "Price", name: "price", type: "number", placeholder: "Enter the price" },
                        { label: "Location", name: "location", type: "text", placeholder: "Enter the location" },
                        { label: "Country", name: "country", type: "text", placeholder: "Enter the country" }
                    ].map(({ label, name, type, placeholder, isImage }) => (
                        <div key={name}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                                {label}:
                                <input
                                    type={type}
                                    name={name}
                                    value={isImage ? formData.image.url : (formData as any)[name]}
                                    onChange={isImage ? handleImageChange : handleChange}
                                    required
                                    placeholder={placeholder}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        border: '1px solid #ddd',
                                        outline: 'none',
                                        transition: 'border 0.3s ease',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}
                                    onFocus={(e) => e.currentTarget.style.border = '1px solid #dd2476'}
                                    onBlur={(e) => e.currentTarget.style.border = '1px solid #ddd'}
                                />
                            </label>
                        </div>
                    ))}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                            Description:
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Enter a brief description of the listing"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd',
                                    outline: 'none',
                                    transition: 'border 0.3s ease',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    minHeight: '120px',
                                    resize: 'vertical'
                                }}
                                onFocus={(e) => e.currentTarget.style.border = '1px solid #dd2476'}
                                onBlur={(e) => e.currentTarget.style.border = '1px solid #ddd'}
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        style={{
                            padding: '12px 25px',
                            backgroundColor: '#dd2476',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
                            transition: 'background-color 0.3s, transform 0.3s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c2185b'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dd2476'}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Add Listing
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}
