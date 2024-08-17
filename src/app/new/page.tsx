"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function AddListingForm() {
    const router=useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image: {
            url: "",
            filename:"listingimage",
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
            const response = await axios.post("/api/listings/new", formData);
            setSuccess("Listing added successfully!");
            setFormData({
                title: "",
                description: "",
                image: {
                    url: "",
                    filename:"listingimage"
                },
                price: 0,
                location: "",
                country: ""
            });
            router.push("/home");
        } catch (err: any) {
            setError("Error adding listing: " + err.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to right, #ff512f, #dd2476)', // Updated gradient for a more dynamic background
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                maxWidth: '600px',
                width: '100%',
                background: '#fff',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
                color: '#333',
                transform: 'scale(1)',
                transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                            Title:
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="Enter the title of the listing"
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
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                            Image URL:
                            <input
                                type="text"
                                name="url"
                                value={formData.image.url}
                                onChange={handleImageChange}
                                required
                                placeholder="Enter the URL of the listing image"
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
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                            Price:
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                placeholder="Enter the price of the listing"
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
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                            Location:
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                placeholder="Enter the location of the listing"
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
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                            Country:
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                required
                                placeholder="Enter the country of the listing"
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
            </div>
        </div>
    );
}
