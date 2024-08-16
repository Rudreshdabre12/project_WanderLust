"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type ListingFormData = {
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    location: string;
    country: string;
};

export default function EditListing({ params }: { params: { id: string } }) {
    const id = params.id;
    const [formData, setFormData] = useState<ListingFormData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await axios.post("/api/listings/show", { id });
                setFormData({
                    title: response.data.title,
                    description: response.data.description,
                    imageUrl: response.data.image.url,
                    price: response.data.price,
                    location: response.data.location,
                    country: response.data.country,
                });
            } catch (err: any) {
                setError("Error fetching listing: " + err.message);
            }
        };
        fetchListing();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
    
        setFormData((prevData) => {
            if (!prevData) return null;
    
            return {
                ...prevData,
                [name]: value as string,
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        try {
            await axios.put("/api/listings/edit", { id, ...formData });
            setSuccess("Listing updated successfully!");
            router.push('/home');
        } catch (err: any) {
            setError("Error updating listing: " + err.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ff5f6d, #ffc371)',
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
                borderRadius: '10px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                color: '#333',
                textAlign: 'center',
                border: '2px solid #ff5f6d'
            }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                }}>Edit Listing</h1>
                {success && <p style={{ color: "green", fontWeight: 'bold' }}>{success}</p>}
                {error && <p style={{ color: "red", fontWeight: 'bold' }}>{error}</p>}
                {formData ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '8px' }}>
                                Title:
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="Enter listing title"
                                style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '2px solid #ccc', fontSize: '16px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '8px' }}>
                                Description:
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Enter listing description"
                                style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '2px solid #ccc', fontSize: '16px', minHeight: '120px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '8px' }}>
                                Image URL:
                            </label>
                            <input
                                type="text"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                required
                                placeholder="Enter image URL"
                                style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '2px solid #ccc', fontSize: '16px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '8px' }}>
                                Price:
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                placeholder="Enter listing price"
                                style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '2px solid #ccc', fontSize: '16px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '8px' }}>
                                Location:
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                placeholder="Enter location"
                                style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '2px solid #ccc', fontSize: '16px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '8px' }}>
                                Country:
                            </label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                required
                                placeholder="Enter country"
                                style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '2px solid #ccc', fontSize: '16px' }}
                            />
                        </div>
                        <button type="submit" style={{
                            padding: '12px 24px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#fff',
                            backgroundColor: '#ff5f6d',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease, transform 0.3s ease',
                            width: '100%',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0555b')}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff5f6d')}
                        >
                            Update Listing
                        </button>
                    </form>
                ) : (
                    <p style={{ color: '#333', fontSize: '18px' }}>Loading...</p>
                )}
            </div>
        </div>
    );
}
