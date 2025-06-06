"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Booking {
    _id: string;
    listing: {
        _id: string;
        title: string;
        price: number;
        location: string;
        country: string;
    };
    amount: number;
    status: string;
    bookingDate: string;
    paymentId: string;
    orderId: string;
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
    const [animateCard, setAnimateCard] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserAndBookings = async () => {
            try {
                const userResponse = await axios.post("/api/users/getTokenData");
                if (!userResponse.data?.data?.id) {
                    router.push('/login');
                    return;
                }
                setCurrentUser(userResponse.data.data);
                const bookingsResponse = await axios.get(`/api/bookings?userId=${userResponse.data.data.id}`);
                setBookings(bookingsResponse.data);
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to fetch bookings');
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndBookings();
    }, [router]);

    const handleViewListing = (listingId: string, bookingId: string) => {
        setAnimateCard(bookingId);
        setTimeout(() => {
            router.push(`/show/${listingId}`);
        }, 300);
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        return booking.status.toLowerCase() === filter;
    });

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return {
                    bg: '#ecfdf5',
                    text: '#047857',
                    border: '#d1fae5',
                    icon: '✓',
                    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)'
                };
            case 'cancelled':
                return {
                    bg: '#fef2f2',
                    text: '#b91c1c',
                    border: '#fecaca',
                    icon: '×',
                    gradient: 'linear-gradient(135deg, #ef4444, #ec4899)'
                };
            default:
                return {
                    bg: '#eff6ff',
                    text: '#1d4ed8',
                    border: '#dbeafe',
                    icon: '⋯',
                    gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)'
                };
        }
    };

    // Inline Styles
    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
            padding: '48px 16px',
        },
        maxWidth: {
            maxWidth: '1280px',
            margin: '0 auto'
        },
        headerContainer: {
            position: 'relative' as const,
            marginBottom: '48px'
        },
        headerBlur: {
            position: 'absolute' as const,
            inset: '0',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '16px',
            filter: 'blur(40px)',
            opacity: '0.2'
        },
        headerContent: {
            position: 'relative' as const,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '32px'
        },
        headerFlex: {
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px'
        },
        headerTitle: {
            textAlign: 'center' as const
        },
        title: {
            fontSize: '36px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px'
        },
        subtitle: {
            color: '#6b7280',
            marginTop: '8px'
        },
        buttonGroup: {
            display: 'flex',
            gap: '16px'
        },
        homeButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            color: '#374151',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            textDecoration: 'none'
        },
        exploreButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            border: 'none'
        },
        filterContainer: {
            marginTop: '32px',
            display: 'flex',
            flexWrap: 'wrap' as const,
            gap: '16px',
            alignItems: 'center'
        },
        filterButton: {
            padding: '8px 24px',
            borderRadius: '9999px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            border: 'none'
        },
        filterButtonActive: {
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transform: 'scale(1.05)'
        },
        filterButtonInactive: {
            background: 'white',
            color: '#6b7280',
            border: '1px solid #e5e7eb'
        },
        bookingCount: {
            marginLeft: 'auto',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center'
        },
        grid: {
            display: 'grid',
            gap: '24px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
        },
        bookingCard: {
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            transition: 'all 0.5s ease',
            cursor: 'pointer'
        },
        bookingCardHover: {
            transform: 'scale(1.02)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        },
        cardContent: {
            padding: '24px'
        },
        cardHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px'
        },
        statusBadge: {
            fontSize: '14px',
            fontWeight: '600',
            padding: '4px 12px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '8px'
        },
        listingTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '4px'
        },
        listingLocation: {
            color: '#6b7280',
            fontSize: '14px'
        },
        bookingId: {
            textAlign: 'right' as const
        },
        bookingIdLabel: {
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
        },
        bookingIdValue: {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#1f2937'
        },
        detailsContainer: {
            marginBottom: '16px'
        },
        detailRow: {
            marginBottom: '12px'
        },
        detailLabel: {
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '2px'
        },
        detailValue: {
            color: '#1f2937'
        },
        amount: {
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
        },
        viewButton: {
            width: '100%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '500'
        },
        loadingContainer: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)'
        },
        loadingContent: {
            position: 'relative' as const,
            textAlign: 'center' as const
        },
        spinner: {
            width: '64px',
            height: '64px',
            border: '4px solid white',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        },
        loadingText: {
            marginTop: '16px',
            color: 'white',
            fontSize: '20px',
            fontWeight: '600'
        },
        errorContainer: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #ef4444, #ec4899)'
        },
        errorCard: {
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: '448px',
            width: '100%',
            margin: '0 16px',
            textAlign: 'center' as const
        },
        errorEmoji: {
            fontSize: '64px',
            marginBottom: '16px'
        },
        errorTitle: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px'
        },
        errorMessage: {
            color: '#6b7280',
            marginBottom: '24px'
        },
        errorButton: {
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '16px'
        },
        noBookings: {
            textAlign: 'center' as const,
            padding: '64px 0',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        },
        noBookingsEmoji: {
            fontSize: '72px',
            marginBottom: '24px'
        },
        noBookingsTitle: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
        },
        noBookingsText: {
            color: '#6b7280',
            marginBottom: '32px'
        },
        discoverButton: {
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingContent}>
                    <div style={styles.spinner}></div>
                    <div style={styles.loadingText}>
                        Loading your adventures...
                    </div>
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
        return (
            <div style={styles.errorContainer}>
                <div style={styles.errorCard}>
                    <div style={styles.errorEmoji}>😕</div>
                    <h2 style={styles.errorTitle}>Oops! Something went wrong</h2>
                    <p style={styles.errorMessage}>{error}</p>
                    <button 
                        style={styles.errorButton}
                        onClick={() => router.push('/home')}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.maxWidth}>
                {/* Header Section */}
                <div style={styles.headerContainer}>
                    <div style={styles.headerBlur}></div>
                    <div style={styles.headerContent}>
                        <div style={styles.headerFlex}>
                            <div style={styles.headerTitle}>
                                <h1 style={styles.title}>
                                    Your Travel Journey
                                </h1>
                                <p style={styles.subtitle}>
                                    Welcome back, {currentUser?.username || 'Traveler'}! Here are your booking adventures.
                                </p>
                            </div>
                            <div style={styles.buttonGroup}>
                                <button 
                                    style={styles.homeButton}
                                    onClick={() => router.push('/home')}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.borderColor = '#a5b4fc';
                                        e.currentTarget.style.color = '#6366f1';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.color = '#374151';
                                    }}
                                >
                                    <span style={{fontSize: '20px'}}>🏠</span>
                                    Home
                                </button>
                                <button 
                                    style={styles.exploreButton}
                                    onClick={() => router.push('/home')}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #5b21b6, #7c3aed)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
                                    }}
                                >
                                    <span style={{fontSize: '20px'}}>✨</span>
                                    Explore More
                                </button>
                            </div>
                        </div>

                        {/* Filter Pills */}
                        <div style={styles.filterContainer}>
                            {['all', 'confirmed', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status as any)}
                                    style={{
                                        ...styles.filterButton,
                                        ...(filter === status ? styles.filterButtonActive : styles.filterButtonInactive)
                                    }}
                                    onMouseOver={(e) => {
                                        if (filter !== status) {
                                            e.currentTarget.style.background = '#f9fafb';
                                        }
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseOut={(e) => {
                                        if (filter !== status) {
                                            e.currentTarget.style.background = 'white';
                                        }
                                        e.currentTarget.style.transform = filter === status ? 'scale(1.05)' : 'scale(1)';
                                    }}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                            <div style={styles.bookingCount}>
                                <span style={{marginRight: '8px'}}>📊</span>
                                {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bookings Grid */}
                {filteredBookings.length === 0 ? (
                    <div style={styles.noBookings}>
                        <div style={styles.noBookingsEmoji}>🏖️</div>
                        <h2 style={styles.noBookingsTitle}>No bookings found</h2>
                        <p style={styles.noBookingsText}>Time to start your next adventure!</p>
                        <button 
                            style={styles.discoverButton}
                            onClick={() => router.push('/home')}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, #5b21b6, #7c3aed)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
                            }}
                        >
                            Discover Places
                        </button>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {filteredBookings.map((booking, index) => {
                            const statusStyle = getStatusStyle(booking.status);
                            return (
                                <div 
                                    key={booking._id}
                                    style={{
                                        ...styles.bookingCard,
                                        borderLeft: `4px solid ${statusStyle.border}`,
                                        opacity: 0,
                                        animation: `fadeIn 0.5s ease-out ${index * 0.1}s forwards`
                                    }}
                                    onMouseEnter={(e) => {
                                        setSelectedBooking(booking._id);
                                        Object.assign(e.currentTarget.style, styles.bookingCardHover);
                                    }}
                                    onMouseLeave={(e) => {
                                        setSelectedBooking(null);
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                    }}
                                >
                                    <div style={styles.cardContent}>
                                        <div style={styles.cardHeader}>
                                            <div>
                                                <div 
                                                    style={{
                                                        ...styles.statusBadge,
                                                        backgroundColor: statusStyle.bg,
                                                        color: statusStyle.text
                                                    }}
                                                >
                                                    {statusStyle.icon} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                </div>
                                                <h3 style={styles.listingTitle}>
                                                    {booking.listing.title}
                                                </h3>
                                                <p style={styles.listingLocation}>
                                                    📍 {booking.listing.location}, {booking.listing.country}
                                                </p>
                                            </div>
                                            <div style={styles.bookingId}>
                                                <div style={styles.bookingIdLabel}>Booking ID</div>
                                                <div style={styles.bookingIdValue}>
                                                    #{booking.orderId.slice(-6)}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={styles.detailsContainer}>
                                            <div style={styles.detailRow}>
                                                <div style={styles.detailLabel}>Booked On</div>
                                                <div style={styles.detailValue}>
                                                    {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <div style={styles.detailRow}>
                                                <div style={styles.detailLabel}>Amount Paid</div>
                                                <div style={styles.amount}>
                                                    ₹{booking.amount}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{paddingTop: '16px', borderTop: '1px solid #f3f4f6'}}>
                                            <button
                                                style={styles.viewButton}
                                                onClick={() => handleViewListing(booking.listing._id, booking._id)}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.background = 'linear-gradient(135deg, #5b21b6, #7c3aed)';
                                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <span>View Details</span>
                                                <span style={{fontSize: '20px'}}>→</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (min-width: 768px) {
                    .header-flex {
                        flex-direction: row !important;
                    }
                    .header-title {
                        text-align: left !important;
                    }
                }
            `}</style>
        </div>
    );
}