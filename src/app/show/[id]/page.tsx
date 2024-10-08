"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ShowListing({ params }: { params: { id: string } }) {
    const id = params.id;
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await axios.post("/api/listings/show", { id });
                setListing(response.data);
                //onsole.log(response.data.reviews[0].author);
                
                setLoading(false);
            } catch (err: any) {
                console.log(err.message);
                setError("Error fetching listing");
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    const handleEdit = () => {
        router.push(`/edit/${id}`);
    };

    const handleDelete = async () => {
        try {
            await axios.post("/api/listings/delete", { id });
            router.push("/home");
        } catch (err: any) {
            console.log("Error deleting listing:", err.message);
            setError("Error deleting listing");
        }
    };

    const handleHome = () => {
        router.push("/home");
    };

    const handleAddReview = () => {
        router.push(`/review/add/${id}`);
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#fff',
                    fontSize: '24px',
                    textAlign: 'center'
                }}>
                    <div className="spinner" style={{
                        border: '8px solid #f3f3f3', /* Light grey */
                        borderTop: '8px solid #3498db', /* Blue */
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p>Loading...</p>
                </div>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return <div style={{ textAlign: 'center', color: '#fff' }}>{error}</div>;
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            boxSizing: 'border-box',
            position: 'relative'
        }}>
            <div style={{
                position: 'absolute',
                top: 20,
                right: 20,
                zIndex: 10
            }}>
                <button
                    onClick={handleHome}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        color: '#fff',
                        backgroundColor: '#28a745',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                        boxShadow: '0 5px 15px rgba(40, 167, 69, 0.4)',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#218838')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#28a745')}
                >
                    Home
                </button>
            </div>
            <div style={{
                maxWidth: '600px',
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
                alignItems: 'center',
                gap: '20px',
                margin: 'auto'
            }}>
                {listing ? (
                    <>
                        <h2 style={{ 
                            marginBottom: '20px', 
                            fontSize: '28px', 
                            fontWeight: 'bold', 
                            color: '#1f1c2c' 
                        }}>
                            {listing.title}
                        </h2>
                        <p style={{ 
                            marginBottom: '20px', 
                            fontSize: '18px', 
                            lineHeight: '1.6', 
                            color: '#555' 
                        }}>
                            {listing.description}
                        </p>
                        <img src={listing.image.url} alt={listing.title} style={{
                            width: '100%',
                            maxWidth: '300px',
                            borderRadius: '12px',
                            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                            marginBottom: '30px',
                            transition: 'transform 0.3s ease',
                        }} 
                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                        <p style={{ 
                            fontSize: '22px', 
                            fontWeight: 'bold', 
                            color: '#333', 
                            marginBottom: '10px' 
                        }}>
                            Price: ${listing.price}
                        </p>
                        <p style={{ 
                            fontSize: '18px', 
                            color: '#666' 
                        }}>
                            Location: {listing.location}, {listing.country}
                        </p>
                        <div style={{ 
                            marginTop: '30px', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '15px' 
                        }}>
                            <button
                                onClick={handleEdit}
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
                                Edit
                            </button>
                            <button
                                onClick={handleAddReview}
                                style={{
                                    padding: '12px 30px',
                                    fontSize: '16px',
                                    color: '#fff',
                                    backgroundColor: '#ffc107',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease',
                                    boxShadow: '0 5px 15px rgba(255, 193, 7, 0.4)',
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0a800')}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffc107')}
                            >
                                Add Review
                            </button>
                        </div>

                        <div style={{
    marginTop: '40px',
    width: '100%',
    padding: '0 20px',
    boxSizing: 'border-box'
}}>
    <h3 style={{
        fontSize: '30px',
        fontWeight: 'bold',
        color: '#1f1c2c',
        marginBottom: '30px',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '1.5px'
    }}>
        Reviews
    </h3>
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    }}>
        {listing.reviews.map((review: any, index: number) => (
            <div key={index} style={{
                background: '#ffffff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                border: '1px solid #ddd',
                position: 'relative'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '10px'
                }}>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAd5avdba8EiOZH8lmV3XshrXx7dKRZvhx-A&s" alt="Avatar" style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        marginRight: '10px'
                    }} />
                    <span style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#1f1c2c'
                    }}>
                        {review.author.username}
                    </span>
                </div>
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#3498db',
                    backgroundColor: '#eaf3ff',
                    borderRadius: '4px',
                    padding: '5px 10px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                }}>
                    {review.rating} ★
                </div>
                <div style={{
                    marginTop: '20px',
                    marginBottom: '10px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#333'
                }}>
                    {review.comment}
                </div>
                <div style={{
                    marginTop: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#999'
                }}>
                    <div>
                        <span style={{ marginRight: '10px' }}>👍 {review.likes}</span>
                        <span>💬 {review.comments}</span>
                    </div>
                    <div>
                        {review.timestamp}
                    </div>
                </div>
                <style jsx>{`
                    div:hover {
                        transform: scale(1.02);
                        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
                    }
                `}</style>
            </div>
        ))}
    </div>
</div>

                    </>
                ) : (
                    <div style={{ color: '#fff', fontSize: '18px' }}>Listing not found</div>
                )}
            </div>
        </div>
    );
}
