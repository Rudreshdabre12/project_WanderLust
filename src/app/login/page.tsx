"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const [user, setUser] = React.useState({
        username: "",
        password: "",
    });
    const [buttonDisabled, setButtonDisabled] = React.useState(true);

    const onLogin = async () => {
        try {
            const response = await axios.post("/api/users/login", user);
            toast.success("Login successful!"); // Success notification
            router.push("/home");
        } catch (error: any) {
            toast.error("Login failed!,wrong username or password "); // Error notification
        }
    };

    useEffect(() => {
        if (user.username.length > 0 && user.password.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user]);

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(to right, #ff7e5f, #feb47b)', // Vibrant gradient background
                padding: '20px',
            }}
        >
            <div
                style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                    maxWidth: '400px',
                    width: '100%',
                    textAlign: 'center',
                    transform: 'scale(1)',
                    transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <Toaster /> {/* Add Toaster component to render toast notifications */}
                <h1 style={{ marginBottom: '20px', color: '#333' }}>Login</h1>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Username</label>
                    <input
                        className="text-black"
                        type="text"
                        id="username"
                        value={user.username}
                        onChange={(e) => setUser({ ...user, username: e.target.value })}
                        placeholder="Enter your username"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            outline: 'none',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'border-color 0.3s ease',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#feb47b'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                    />
                </div>
                <div style={{ marginBottom: '30px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Password</label>
                    <input
                        className="text-black"
                        type="password"
                        id="password"
                        value={user.password}
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                        placeholder="Enter your password"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            outline: 'none',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'border-color 0.3s ease',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#feb47b'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                    />
                </div>
                <button
                    onClick={onLogin}
                    disabled={buttonDisabled}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: buttonDisabled ? '#999' : '#feb47b',
                        color: 'white',
                        cursor: buttonDisabled ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s ease, transform 0.3s ease',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                    }}
                    onMouseOver={(e) => {
                        if (!buttonDisabled) e.currentTarget.style.backgroundColor = '#f4a261';
                    }}
                    onMouseOut={(e) => {
                        if (!buttonDisabled) e.currentTarget.style.backgroundColor = '#feb47b';
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {buttonDisabled ? "Enter details" : "Login"}
                </button>
                <div style={{ marginTop: '20px' }}>
                    <Link href="/signup" style={{ color: '#feb47b', textDecoration: 'none', fontWeight: 'bold' }}>
                        Don’t have an account? Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
