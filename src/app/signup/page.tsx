"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export default function SignupPage() {
    const router = useRouter();
    const [user, setUser] = React.useState({
        email: "",
        password: "",
        username: "",
    });
    const [buttonDisabled, setButtonDisabled] = React.useState(true);

    const onSignup = async () => {
        try {
            const response = await axios.post("/api/users/signup", user);
            console.log("Signup success", response.data);
            router.push("/login");
        } catch (error: any) {
            console.log("Signup failed", error.message);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (user.email.length > 0 && user.password.length > 0 && user.username.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user]);

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(to right, #ff7e5f, #feb47b)', // Gradient background
                padding: '20px',
            }}
        >
            <div
                style={{
                    background: '#fff',
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
                <h1 style={{ marginBottom: '20px', color: '#333', fontSize: '24px', fontWeight: 'bold' }}>Signup</h1>
                <hr style={{ marginBottom: '30px', borderColor: '#ddd' }} />
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555', textAlign: 'left' }}>Username</label>
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
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            outline: 'none',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'border-color 0.3s ease',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#feb47b'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555', textAlign: 'left' }}>Email</label>
                    <input
                        className="text-black"
                        type="email"
                        id="email"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        placeholder="Enter your email"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            outline: 'none',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'border-color 0.3s ease',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#feb47b'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                    />
                </div>
                <div style={{ marginBottom: '30px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555', textAlign: 'left' }}>Password</label>
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
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            outline: 'none',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'border-color 0.3s ease',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#feb47b'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                    />
                </div>
                <button
                    onClick={onSignup}
                    disabled={buttonDisabled}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: buttonDisabled ? '#ddd' : '#feb47b',
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
                    {buttonDisabled ? "Please fill all fields" : "Signup"}
                </button>
                <div style={{ marginTop: '20px' }}>
                    <Link href="/login" style={{
                        color: '#feb47b',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'inline-block',
                        marginTop: '10px',
                        transition: 'color 0.3s ease',
                    }}>
                        Already have an account? Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
