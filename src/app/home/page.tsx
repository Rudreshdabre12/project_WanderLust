"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners"; 

export default function HomePage() {
    const router = useRouter();
    const [listings, setListings] = useState<any[] | null>(null);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await axios.get("/api/listings/home");
                setListings(response.data);
            } catch (err: any) {
                console.log("error in fetching listings", err.message);
            } finally {
                setLoading(false); 
            }
        };
        fetchListings();
    }, []);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await axios.post("/api/users/getTokenData");
                if (response.data && Object.keys(response.data).length > 0) {
                    setStatus(true);
                } else {
                    setStatus(false);
                }
            } catch (err: any) {
                console.log("error in fetching status", err.message);
            }
        };
        checkStatus();
    }, []);

    const handleClick = async (id: string) => {
        try {
            router.push(`/show/${id}`);
        } catch (err: any) {
            console.log(err.message);
        }
    };

    const handleCreate = () => {
        router.push('/new');
    };

    const handleLogin = () => {
        router.push('/login');
    };

    const handleLogout = async () => {
        try {
            await axios.get("/api/users/logout");
            router.push('/login');
        } catch (err: any) {
            console.log("Error logging out:", err.message);
        }
    };

    const handleSignup = () => {
        router.push('/signup');
    };

    const handleHome = () => {
        router.push('/');
    };

    return (
        <div style={{ 
            position: 'relative', 
            padding: '40px', 
            backgroundColor: '#f4f4f9',  
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
            borderRadius: '15px',
            minHeight: '100vh' 
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button
                    onClick={handleHome}
                    style={{
                        padding: '12px 24px',
                        fontSize: '18px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                        transition: 'background-color 0.3s, transform 0.3s',
                        position: 'absolute',
                        top: '20px',
                        right: '20px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Home
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {status ? (
                        <>
                            <button
                                onClick={handleCreate}
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '18px',
                                    backgroundColor: '#0070f3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                                    transition: 'background-color 0.3s, transform 0.3s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#005bb5'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0070f3'}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Create
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '18px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                                    transition: 'background-color 0.3s, transform 0.3s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleLogin}
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '18px',
                                    backgroundColor: '#0070f3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                                    transition: 'background-color 0.3s, transform 0.3s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#005bb5'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0070f3'}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Login
                            </button>
                            <button
                                onClick={handleSignup}
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '18px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                                    transition: 'background-color 0.3s, transform 0.3s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Signup
                            </button>
                        </>
                    )}
                </div>
            </div>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                    <ClipLoader size={80} color={"#0070f3"} loading={loading} />
                </div>
            ) : (
                listings ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                        {listings.map((listing) => (
                            <div
                                key={listing._id}
                                className="listing"
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    maxWidth: '300px',
                                    width: '100%',
                                    marginBottom: '20px'
                                }}
                                onClick={() => handleClick(listing._id)}
                            >
                                <img
                                    src={listing.image.url}
                                    alt={listing.title}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'cover',
                                        borderBottom: '2px solid #f0f0f0',
                                        transition: 'transform 0.3s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                                <div style={{ padding: '15px' }}>
                                    <h2 style={{ fontSize: '24px', margin: '0 0 10px 0', color: '#333', fontWeight: 'bold' }}>{listing.title}</h2>
                                    <p style={{ fontSize: '16px', color: '#555', marginBottom: '10px' }}>{listing.description}</p>
                                    <p style={{ fontSize: '20px', margin: '10px 0', color: '#000', fontWeight: 'bold' }}>Price: ${listing.price}</p>
                                    <p style={{ fontSize: '16px', color: '#777' }}>Location: {listing.location}, {listing.country}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#666' }}>No listings available.</p>
                )
            )}
        </div>
    );
}
