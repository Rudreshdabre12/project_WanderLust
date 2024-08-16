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
                [name]: value as string, // Ensure value is treated as string
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
            background: 'url("https://source.unsplash.com/1600x900/?abstract") no-repeat center center fixed',
            backgroundSize: 'cover',
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
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                color: '#333',
                textAlign: 'center'
            }}>
                <h1>Edit Listing</h1>
                {success && <p style={{ color: "green" }}>{success}</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                {formData ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label>
                                Title:
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter listing title"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </label>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>
                                Description:
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter listing description"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px' }}
                                />
                            </label>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>
                                Image URL:
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter image URL"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </label>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>
                                Price:
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter listing price"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </label>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>
                                Location:
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter location"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </label>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>
                                Country:
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter country"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </label>
                        </div>
                        <button type="submit" style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            color: '#fff',
                            backgroundColor: '#28a745',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease'
                        }}>
                            Update Listing
                        </button>
                    </form>
                ) : (
                    <p style={{ color: '#fff' }}>Loading...</p>
                )}
            </div>
        </div>
    );
}
