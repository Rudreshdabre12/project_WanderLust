"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AddReview({ params }: { params: { id: string } }) {
    const [formData, setFormData] = useState({
        comment: "",
        rating: 1,
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const listingId = params.id;
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: name === "rating" ? Number(value) : value,
        }));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response=await axios.post("/api/users/getTokenData");
             const userId=response.data.id;
            const createdReview = {
                ...formData,
                author: userId,
                id:listingId,
            };

            const res=await axios.post("/api/reviews/add", createdReview);
            console.log(res);
            setLoading(false);
            router.push(`/show/${listingId}`);
        } catch (err: any) {
            console.log("Error adding review:", err.message);
            setError("Error submitting review");
            setLoading(false);
        }
    };
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            boxSizing: 'border-box',
        }}>
            <form
                onSubmit={handleSubmit}
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                    color: '#333',
                    textAlign: 'center',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}
            >
                <h2 style={{
                    marginBottom: '20px',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#1f1c2c'
                }}>
                    Add a Review
                </h2>
                <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    placeholder="Write your comment..."
                    required
                    style={{
                        padding: '10px',
                        fontSize: '16px',
                        width: '100%',
                        height: '100px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                    }}
                />
                <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    required
                    style={{
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                </select>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '12px 30px',
                        fontSize: '16px',
                        color: '#fff',
                        backgroundColor: '#007bff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                        boxShadow: '0 5px 15px rgba(0, 123, 255, 0.4)',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
                >
                    {loading ? "Submitting..." : "Submit Review"}
                </button>
            </form>
        </div>
    );
}
