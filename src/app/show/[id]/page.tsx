"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import Script from 'next/script';

// Add type definition for Razorpay at the top of the file
declare global {
    interface Window {
        Razorpay: any;
    }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function ShowListing({ params }: { params: { id: string } }) {
    const id = params.id;
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null); // Add current user state
    const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
    const router = useRouter();
    const [userid, setUserid] = useState<any>(null);
    const [listingState, setListingState] = useState(listing);
    const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    //const [listingid, setListingid] = useState<any>(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [listingResponse, userResponse] = await Promise.all([
                    axios.post("/api/listings/show", { id }),
                    axios.post("/api/users/getTokenData", {}, {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    })
                ]);

                setListing(listingResponse.data);
                setCurrentUser(userResponse.data.data);

                // Only fetch bookings if user is logged in
                if (userResponse.data.data?.id) {
                    // Fetch only the current user's bookings for this listing
                    const bookingsResponse = await axios.get(`/api/bookings`, {
                        params: {
                            listingId: id,
                            userId: userResponse.data.data.id
                        },
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    setBookings(bookingsResponse.data);
                }
            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
                setLoadingBookings(false);
            }
        };
        fetchData();

        // Fetch current user
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.post("/api/users/getTokenData", {}, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                setUserid(response.data.data.id);
                setCurrentUser(response.data.data);
            } catch (err) {
                console.log("Not authenticated");
            }
        };
        fetchCurrentUser();
    }, [id]);

    // Load Razorpay script
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadRazorpay = () => {
            if (window.Razorpay) {
                console.log('Razorpay already loaded');
                setIsRazorpayLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => {
                console.log('Razorpay script loaded successfully');
                if (window.Razorpay) {
                    console.log('Razorpay object is available');
                    setIsRazorpayLoaded(true);
                }
            };
            script.onerror = (e) => {
                console.error('Error loading Razorpay script:', e);
                alert('Payment system failed to load. Please refresh the page.');
            };
            document.body.appendChild(script);
        };

        loadRazorpay();
    }, []);

    const handleEdit = () => {
        router.push(`/edit/${id}`);
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this listing?")) {
            try {
                await axios.post("/api/listings/delete", { id });
                router.push("/home");
            } catch (err: any) {
                console.log("Error deleting listing:", err.message);
                setError("Error deleting listing");
            }
        }
    };

    const handleHome = () => {
        router.push("/home");
    };
     const handleAddLike = async (reviewId: string) => {
  try {
    const res = await axios.put(`/api/reviews/${reviewId}/like`);
    alert("Thanks for your feedback!");
    // Optionally trigger refresh or update UI locally
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.message || "Failed to like review");
  }
};
    const handleAddReview = () => {
        router.push(`/review/add/${id}`);
    };

    const verifyPayment = async (paymentId: string, orderId: string, signature: string, amount: number) => {
        try {
            const response = await axios.post('/api/payment/verify', {
                paymentId,
                orderId,
                signature,
                listingId: id,
                amount
            });
            return response.data.success;
        } catch (error) {
            console.error('Payment verification failed:', error);
            return false;
        }
    };

    const handleBook = async () => {
        if (!isRazorpayLoaded) {
            console.log('Waiting for Razorpay to load...');
            // Try to load Razorpay again
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => {
                console.log('Razorpay loaded on demand');
                if (window.Razorpay) {
                    setIsRazorpayLoaded(true);
                    // Retry the booking process
                    handleBook();
                }
            };
            document.body.appendChild(script);
            return;
        }

        if (isProcessingPayment) {
            alert('Payment is already in progress. Please wait...');
            return;
        }

        if (!currentUser) {
            alert('Please login to make a booking');
            router.push('/login');
            return;
        }

        try {
            setIsProcessingPayment(true);
            console.log('Creating payment order...');

            // Create order on the server
            const response = await axios.post('/api/payment', {
                amount: listing.price,
                currency: 'INR'
            });

            console.log('Payment order response:', response.data);

            if (!response.data.success) {
                throw new Error('Failed to create order');
            }

            const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
            if (!razorpayKeyId) {
                throw new Error('Razorpay key not configured');
            }

            console.log('Initializing payment with key:', razorpayKeyId);

            const options = {
                key: razorpayKeyId,
                amount: response.data.order.amount,
                currency: response.data.order.currency,
                name: "WanderLust",
                description: `Booking for ${listing.title}`,
                order_id: response.data.order.id,
                prefill: {
                    name: currentUser?.username || '',
                    email: currentUser?.email || '',
                },
                handler: function (response: any) {
                    console.log('Payment successful, verifying...', response);
                    handlePaymentVerification(response);
                },
                modal: {
                    ondismiss: function() {
                        console.log('Payment modal dismissed');
                        setIsProcessingPayment(false);
                    },
                    confirm_close: true,
                    escape: true,
                    animation: true // Enable animation
                },
                theme: {
                    color: "#667eea"
                }
            };

            console.log('Creating Razorpay instance...');
            const paymentObject = new window.Razorpay(options);
            console.log('Opening payment modal...');
            paymentObject.open();

            // Add event listeners for better error handling
            paymentObject.on('payment.failed', function (response: any) {
                console.error('Payment failed:', response.error);
                alert(`Payment failed: ${response.error.description}`);
                setIsProcessingPayment(false);
            });

        } catch (err: any) {
            console.error('Payment error:', err);
            alert(`Failed to initiate payment: ${err.message}`);
            setIsProcessingPayment(false);
        }
    };

    const handlePaymentVerification = async (paymentResponse: any) => {
        try {
            console.log('Verifying payment...', {
                paymentId: paymentResponse.razorpay_payment_id,
                orderId: paymentResponse.razorpay_order_id,
                listingId: id,
            });

            const verificationResponse = await axios.post('/api/payment/verify', {
                paymentId: paymentResponse.razorpay_payment_id,
                orderId: paymentResponse.razorpay_order_id,
                signature: paymentResponse.razorpay_signature,
                listingId: id,
                amount: listing.price * 100 // Convert to paise
            });

            console.log('Verification response:', verificationResponse.data);

            if (verificationResponse.data.success) {
                alert('Payment Successful! Booking confirmed.');
                router.refresh();
                router.push('/bookings');
            } else {
                throw new Error(verificationResponse.data.message || 'Payment verification failed');
            }
        } catch (err: any) {
            console.error('Payment verification failed:', err);
            alert(`Payment verification failed: ${err.message}`);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // Add custom styles for Razorpay modal
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .razorpay-checkout-frame {
                max-width: 100% !important;
            }
            .razorpay-payment-button {
                display: none !important;
            }
            .razorpay-container svg {
                width: 24px !important;
                height: 24px !important;
                min-width: 24px !important;
                min-height: 24px !important;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const handleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        // Implement wishlist API call
    };

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <h2>Oops! Something went wrong</h2>
                    <p>{error}</p>
                    <button onClick={handleHome} className="home-btn">Go Home</button>
                </div>
                <style jsx>{`
                    .error-container {
                        min-height: 100vh;
                        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        text-align: center;
                        color: white;
                        padding: 20px;
                    }
                    .home-btn {
                        padding: 12px 24px;
                        background: rgba(255, 255, 255, 0.2);
                        border: 2px solid white;
                        color: white;
                        border-radius: 25px;
                        cursor: pointer;
                        margin-top: 20px;
                        transition: all 0.3s ease;
                    }
                    .home-btn:hover {
                        background: white;
                        color: #ff6b6b;
                        transform: translateY(-2px);
                    }
                `}</style>
            </div>
        );
    }

    if (!listing || loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{ color: 'white', fontSize: '20px' }}>Loading...</div>
            </div>
        );
    }

    const isOwner = currentUser?.id === listing?.owner;

    return (
        <div className="listing-container">
            {/* Navigation Bar */}
            <nav className="nav-bar">
                <button onClick={handleHome} className="home-button">
                    <span>🏠</span> Home
                </button>
            </nav>

            {listing ? (
                <>
                    {/* Hero Image Section */}
                    <div className="hero-section">
                        <div className="hero-image-container" style={{ position: 'relative', height: '500px' }}>
                            <Image 
                                src={listing.image.url} 
                                alt={listing.title} 
                                fill
                                priority
                                sizes="100vw"
                                style={{ objectFit: 'cover' }}
                                className="hero-image"
                            />
                            <div className="hero-overlay"></div>
                        </div>
                        
                        {/* Listing Info Overlay */}
                        <div className="listing-info-overlay">
                            <div className="listing-header">
                                <h1 className="listing-title">{listing.title}</h1>
                                <div className="listing-meta">
                                    <span className="location">📍 {listing.location}, {listing.country}</span>
                                    <span className="price">${listing.price}/night</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="main-content">
                        <div className="content-wrapper">
                            {/* Left Column */}
                            <div className="left-column">
                                {/* Owner Info */}
                                <div className="owner-section">
                                    <div className="owner-info">
                                        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                                            <Image 
                                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" 
                                                alt="Owner" 
                                                fill
                                                sizes="100px"
                                                style={{ objectFit: 'cover' }}
                                                className="owner-avatar"
                                            />
                                        </div>
                                        <div className="owner-details">
                                            <h3>Hosted by {listing.owner?.username || 'Host'}</h3>
                                            <p>Superhost · 2 years hosting</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="description-section">
                                    <h2>About this place</h2>
                                    <p className="description-text">{listing.description}</p>
                                </div>

                                {/* Bookings Section - Only show if user is logged in */}
                                {currentUser && (
                                    <div style={{
                                        background: 'linear-gradient(to right bottom, #ffffff, #f8f9ff)',
                                        borderRadius: '24px',
                                        padding: '32px',
                                        marginBottom: '32px',
                                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid rgba(102, 126, 234, 0.1)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '4px',
                                            background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c)',
                                            backgroundSize: '400% 400%'
                                        }}></div>
                                        
                                        <h2 style={{
                                            fontSize: '28px',
                                            fontWeight: 800,
                                            marginBottom: '24px',
                                            color: '#2d3748',
                                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>Your Bookings for this Listing</h2>
                                        
                                        {loadingBookings ? (
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                padding: '32px'
                                            }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    border: '4px solid #f3f3f3',
                                                    borderTop: '4px solid #667eea',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite'
                                                }}></div>
                                            </div>
                                        ) : bookings.length === 0 ? (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '48px 20px',
                                                background: 'rgba(255, 255, 255, 0.8)',
                                                borderRadius: '16px',
                                                backdropFilter: 'blur(10px)'
                                            }}>
                                                <div style={{
                                                    fontSize: '48px',
                                                    marginBottom: '16px'
                                                }}>📅</div>
                                                <p style={{
                                                    color: '#4a5568',
                                                    fontSize: '18px',
                                                    marginBottom: '24px'
                                                }}>You haven&apos;t booked this place yet</p>
                                                {!isOwner && (
                                                    <button
                                                        onClick={handleBook}
                                                        style={{
                                                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                                            color: 'white',
                                                            padding: '14px 32px',
                                                            borderRadius: '50px',
                                                            border: 'none',
                                                            fontSize: '16px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: '0 10px 20px rgba(102, 126, 234, 0.2)',
                                                            transform: 'translateY(0)'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                                            e.currentTarget.style.boxShadow = '0 15px 30px rgba(102, 126, 234, 0.3)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.2)';
                                                        }}
                                                    >
                                                        Book Now
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{
                                                display: 'grid',
                                                gap: '20px'
                                            }}>
                                                {bookings.map((booking) => (
                                                    <div 
                                                        key={booking._id}
                                                        style={{
                                                            background: 'white',
                                                            borderRadius: '16px',
                                                            padding: '24px',
                                                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
                                                            border: '1px solid rgba(102, 126, 234, 0.1)',
                                                            transition: 'all 0.3s ease',
                                                            cursor: 'pointer',
                                                            position: 'relative',
                                                            overflow: 'hidden'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.1)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.05)';
                                                        }}
                                                    >
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'flex-start',
                                                            marginBottom: '16px'
                                                        }}>
                                                            <div>
                                                                <div style={{
                                                                    fontSize: '18px',
                                                                    fontWeight: 700,
                                                                    color: '#2d3748',
                                                                    marginBottom: '8px'
                                                                }}>
                                                                    Booking Reference: #{booking.orderId.slice(-6)}
                                                                </div>
                                                                <div style={{
                                                                    color: '#718096',
                                                                    fontSize: '14px',
                                                                    marginBottom: '8px'
                                                                }}>
                                                                    {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })}
                                                                </div>
                                                                <div style={{
                                                                    color: '#667eea',
                                                                    fontWeight: 600,
                                                                    fontSize: '16px'
                                                                }}>
                                                                    Amount: ₹{booking.amount}
                                                                </div>
                                                            </div>
                                                            <div style={{
                                                                padding: '8px 16px',
                                                                borderRadius: '50px',
                                                                fontSize: '14px',
                                                                fontWeight: 600,
                                                                background: booking.status === 'confirmed' 
                                                                    ? 'rgba(72, 187, 120, 0.1)'
                                                                    : booking.status === 'cancelled'
                                                                    ? 'rgba(245, 101, 101, 0.1)'
                                                                    : 'rgba(102, 126, 234, 0.1)',
                                                                color: booking.status === 'confirmed'
                                                                    ? '#48bb78'
                                                                    : booking.status === 'cancelled'
                                                                    ? '#f56565'
                                                                    : '#667eea'
                                                            }}>
                                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            fontSize: '14px',
                                                            color: '#a0aec0',
                                                            padding: '12px',
                                                            background: '#f7fafc',
                                                            borderRadius: '8px',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            Payment ID: {booking.paymentId}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Reviews Section */}
                                <div className="reviews-section">
                                    <div className="reviews-header">
                                        <div className="reviews-title-container">
                                            <h2>⭐ Reviews</h2>
                                            <div className="reviews-count-badge">
                                                {listing.reviews?.length || 0} reviews
                                            </div>
                                        </div>
                                        <button onClick={handleAddReview} className="add-review-btn">
                                            <span className="btn-icon">✍️</span>
                                            Add Review
                                        </button>
                                    </div>
                                    
                                    {listing.reviews && listing.reviews.length > 0 ? (
                                        <div className="reviews-grid">
                                            {listing.reviews.map((review: any, index: number) => (
                                                <div 
                                                    key={index} 
                                                    className="review-card"
                                                    style={{ animationDelay: `${index * 0.1}s` }}
                                                >
                                                    <div className="review-card-inner">
                                                        <div className="review-header">
                                                            <div className="reviewer-main">
                                                                <div className="reviewer-avatar-container" style={{ position: 'relative', width: '50px', height: '50px' }}>
                                                                    <Image 
                                                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" 
                                                                        alt="Reviewer" 
                                                                        fill
                                                                        sizes="50px"
                                                                        style={{ objectFit: 'cover' }}
                                                                        className="reviewer-avatar"
                                                                    />
                                                                    <div className="online-indicator"></div>
                                                                </div>
                                                                <div className="reviewer-info">
                                                                    <h4 className="reviewer-name">
                                                                        {review.author?.username || 'Anonymous'}
                                                                    </h4>
                                                                    <div className="rating-container">
                                                                        <div className="stars">
                                                                            {[...Array(5)].map((_, i) => (
                                                                                <span 
                                                                                    key={i}
                                                                                    className={`star ${i < (review.rating || 5) ? 'filled' : ''}`}
                                                                                >
                                                                                    ⭐
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                        <span className="rating-text">
                                                                            {review.rating || 5}/5
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="review-meta">
                                                                <span className="review-date">
                                                                    {review.timestamp || '2 days ago'}
                                                                </span>
                                                                <div className="verified-badge">
                                                                    ✓ Verified Stay
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="review-content">
                                                            <p className="review-comment">
                                                                &quot;{review.comment || "Amazing experience! Highly recommended."}&quot;
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="review-footer">
                                                            <div className="review-actions">
                                                                <button className="review-action like-btn"  onClick={() => handleAddLike(review._id)}>
                                                                    <span className="action-icon">👍</span>
                                                                    <span className="action-text">Helpful</span>
                                                                    <span className="action-count">{review.likes}</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Decorative elements */}
                                                    <div className="review-decoration">
                                                        <div className="decoration-dot dot-1"></div>
                                                        <div className="decoration-dot dot-2"></div>
                                                        <div className="decoration-dot dot-3"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-reviews">
                                            <div className="no-reviews-icon">📝</div>
                                            <h3>No reviews yet</h3>
                                            <p>Be the first to share your experience!</p>
                                            <button onClick={handleAddReview} className="first-review-btn">
                                                Write First Review
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Booking Card */}
                            <div className="right-column">
                                <div className="booking-card">
                                    <div className="booking-header">
                                        <span className="booking-price">${listing.price}</span>
                                        <span className="booking-unit">per night</span>
                                    </div>
                                    
                                    <div className="booking-actions">
                                        <button onClick={handleBook} className="book-btn">
                                            Reserve Now
                                        </button>
                                        <button 
                                            onClick={handleWishlist} 
                                            className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
                                        >
                                            {isWishlisted ? '❤️' : '🤍'} Wishlist
                                        </button>
                                    </div>

                                    {isOwner && (
                                        <div className="owner-actions">
                                            <button onClick={handleEdit} className="edit-btn">
                                                ✏️ Edit Listing
                                            </button>
                                            <button onClick={handleDelete} className="delete-btn">
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="not-found">
                    <h2>Listing not found</h2>
                    <button onClick={handleHome} className="home-btn">Go Home</button>
                </div>
            )}

            <style jsx>{`
                .listing-container {
                    min-height: 100vh;
                    background: #f8f9fa;
                }

                .nav-bar {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    z-index: 1000;
                }

                .home-button {
                    padding: 12px 20px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .home-button:hover {
                    background: rgba(0, 0, 0, 0.9);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                }

                .hero-section {
                    position: relative;
                    height: 60vh;
                    min-height: 400px;
                    overflow: hidden;
                }

                .hero-image-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .hero-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .hero-image:hover {
                    transform: scale(1.02);
                }

                .hero-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        to bottom,
                        rgba(0, 0, 0, 0.1) 0%,
                        rgba(0, 0, 0, 0.4) 70%,
                        rgba(0, 0, 0, 0.7) 100%
                    );
                }

                .listing-info-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 40px;
                    color: white;
                    z-index: 10;
                }

                .listing-title {
                    font-size: 3rem;
                    font-weight: 800;
                    margin-bottom: 16px;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
                    animation: slideUpFadeIn 0.8s ease-out;
                }

                .listing-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 1.2rem;
                    animation: slideUpFadeIn 0.8s ease-out 0.2s both;
                }

                .location {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .price {
                    font-size: 2rem;
                    font-weight: 700;
                    background: linear-gradient(45deg, #ff6b6b, #feca57);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-shadow: none;
                }

                .main-content {
                    padding: 40px 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .content-wrapper {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 40px;
                }

                .left-column {
                    animation: fadeInLeft 0.6s ease-out;
                }

                .right-column {
                    animation: fadeInRight 0.6s ease-out;
                }

                .owner-section {
                    background: white;
                    padding: 30px;
                    border-radius: 16px;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
                    margin-bottom: 30px;
                    transition: transform 0.3s ease;
                }

                .owner-section:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
                }

                .owner-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .owner-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #667eea;
                }

                .owner-details h3 {
                    margin: 0 0 4px 0;
                    font-size: 1.2rem;
                    color: #333;
                }

                .owner-details p {
                    margin: 0;
                    color: #666;
                    font-size: 0.9rem;
                }

                .description-section {
                    background: white;
                    padding: 30px;
                    border-radius: 16px;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
                    margin-bottom: 30px;
                    transition: transform 0.3s ease;
                }

                .description-section:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
                }

                .description-section h2 {
                    color: #333;
                    margin-bottom: 20px;
                    font-size: 1.8rem;
                }

                .description-text {
                    line-height: 1.8;
                    color: #555;
                    font-size: 1.1rem;
                }

                .reviews-section {
                    background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(102, 126, 234, 0.1);
                    position: relative;
                    overflow: hidden;
                }

                .reviews-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
                    background-size: 400% 400%;
                    animation: gradientShift 3s ease infinite;
                }

                .reviews-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                    position: relative;
                }

                .reviews-title-container {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .reviews-title-container h2 {
                    color: #333;
                    font-size: 2.2rem;
                    font-weight: 800;
                    margin: 0;
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .reviews-count-badge {
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                    animation: pulse 2s infinite;
                }

                .add-review-btn {
                    padding: 14px 28px;
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 30px;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 1rem;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    position: relative;
                    overflow: hidden;
                }

                .add-review-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.5s;
                }

                .add-review-btn:hover::before {
                    left: 100%;
                }

                .add-review-btn:hover {
                    transform: translateY(-3px) scale(1.05);
                    box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
                }

                .btn-icon {
                    font-size: 1.1rem;
                    animation: bounce 2s infinite;
                }

                .reviews-grid {
                    display: grid;
                    gap: 24px;
                    animation: fadeInUp 0.6s ease-out;
                }

                .review-card {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid rgba(102, 126, 234, 0.1);
                    position: relative;
                    animation: slideInFromBottom 0.6s ease-out both;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                }

                .review-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                    border-color: rgba(102, 126, 234, 0.3);
                }

                .review-card-inner {
                    padding: 28px;
                    position: relative;
                }

                .review-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }

                .reviewer-main {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .reviewer-avatar-container {
                    position: relative;
                }

                .reviewer-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #fff;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                }

                .review-card:hover .reviewer-avatar {
                    transform: scale(1.1);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                }

                .online-indicator {
                    position: absolute;
                    bottom: 2px;
                    right: 2px;
                    width: 16px;
                    height: 16px;
                    background: #4CAF50;
                    border-radius: 50%;
                    border: 3px solid white;
                    animation: pulse 2s infinite;
                }

                .reviewer-info {
                    flex: 1;
                }

                .reviewer-name {
                    margin: 0 0 8px 0;
                    color: #333;
                    font-size: 1.2rem;
                    font-weight: 700;
                }

                .rating-container {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .stars {
                    display: flex;
                    gap: 2px;
                }

                .star {
                    font-size: 1rem;
                    transition: all 0.2s ease;
                    filter: grayscale(100%);
                }

                .star.filled {
                    filter: grayscale(0%);
                    animation: starGlow 1.5s ease-in-out infinite alternate;
                }

                .rating-text {
                    font-size: 0.9rem;
                    color: #666;
                    font-weight: 600;
                }

                .review-meta {
                    text-align: right;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 8px;
                }

                .review-date {
                    color: #999;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .verified-badge {
                    background: linear-gradient(45deg, #4CAF50, #45a049);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
                }

                .review-content {
                    margin: 20px 0;
                    position: relative;
                }

                .review-comment {
                    font-size: 1.1rem;
                    line-height: 1.7;
                    color: #444;
                    margin: 0;
                    font-style: italic;
                    position: relative;
                    padding-left: 20px;
                }

                .review-comment::before {
                    content: '"';
                    position: absolute;
                    left: 0;
                    top: -5px;
                    font-size: 2rem;
                    color: #667eea;
                    font-family: serif;
                }

                .review-footer {
                    border-top: 1px solid #f0f0f0;
                    padding-top: 20px;
                }

                .review-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-start;
                }

                .review-action {
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 20px;
                    padding: 8px 16px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #666;
                }

                .review-action:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                }

                .like-btn:hover {
                    background: linear-gradient(45deg, #4CAF50, #45a049);
                    color: white;
                    border-color: #4CAF50;
                }

                .reply-btn:hover {
                    background: linear-gradient(45deg, #2196F3, #1976D2);
                    color: white;
                    border-color: #2196F3;
                }

                .share-btn:hover {
                    background: linear-gradient(45deg, #FF9800, #F57C00);
                    color: white;
                    border-color: #FF9800;
                }

                .action-icon {
                    font-size: 1rem;
                }

                .action-text {
                    font-size: 0.85rem;
                }

                .action-count {
                    background: rgba(102, 126, 234, 0.1);
                    color: #667eea;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    min-width: 20px;
                    text-align: center;
                }

                .review-decoration {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    opacity: 0.1;
                }

                .decoration-dot {
                    width: 8px;
                    height: 8px;
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    border-radius: 50%;
                    position: absolute;
                    animation: float 3s ease-in-out infinite;
                }

                .dot-1 { animation-delay: 0s; }
                .dot-2 { left: 15px; animation-delay: 0.5s; }
                .dot-3 { left: 30px; animation-delay: 1s; }

                .no-reviews {
                    text-align: center;
                    padding: 60px 20px;
                    color: #666;
                    animation: fadeInUp 0.6s ease-out;
                }

                .no-reviews-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    opacity: 0.5;
                    animation: bounce 2s infinite;
                }

                .no-reviews h3 {
                    font-size: 1.5rem;
                    margin: 0 0 12px 0;
                    color: #333;
                }

                .no-reviews p {
                    font-size: 1.1rem;
                    margin: 0 0 30px 0;
                    opacity: 0.8;
                }

                .first-review-btn {
                    padding: 16px 32px;
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 30px;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 1.1rem;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                }

                .first-review-btn:hover {
                    transform: translateY(-3px) scale(1.05);
                    box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
                }

                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }

                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-10px); }
                    60% { transform: translateY(-5px); }
                }

                @keyframes slideInFromBottom {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes starGlow {
                    from { filter: drop-shadow(0 0 2px #ffd700); }
                    to { filter: drop-shadow(0 0 8px #ffd700); }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                .booking-card {
                    position: sticky;
                    top: 20px;
                    background: white;
                    padding: 30px;
                    border-radius: 16px;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e9ecef;
                }

                .booking-header {
                    text-align: center;
                    margin-bottom: 24px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #e9ecef;
                }

                .booking-price {
                    font-size: 2.5rem;
                    font-weight: 800;
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .booking-unit {
                    color: #666;
                    font-size: 1rem;
                    margin-left: 8px;
                }

                .booking-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .book-btn {
                    padding: 16px;
                    background: linear-gradient(45deg, #ff6b6b, #feca57);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 1.1rem;
                    transition: all 0.3s ease;
                }

                .book-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
                }

                .wishlist-btn {
                    padding: 14px;
                    background: white;
                    color: #333;
                    border: 2px solid #e9ecef;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .wishlist-btn:hover {
                    border-color: #ff6b6b;
                    color: #ff6b6b;
                    transform: translateY(-2px);
                }

                .wishlist-btn.wishlisted {
                    background: #ffe6e6;
                    border-color: #ff6b6b;
                    color: #ff6b6b;
                }

                .owner-actions {
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .edit-btn {
                    padding: 12px;
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .edit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                }

                .delete-btn {
                    padding: 12px;
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .delete-btn:hover {
                    background: #ff5252;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
                }

                @keyframes slideUpFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fadeInRight {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @media (max-width: 768px) {
                    .content-wrapper {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    
                    .listing-title {
                        font-size: 2rem;
                    }
                    
                    .listing-meta {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                    
                    .price {
                        font-size: 1.5rem;
                    }
                    
                    .booking-card {
                        position: static;
                    }
                }

                .not-found {
                    text-align: center;
                    padding: 60px 20px;
                    color: #666;
                }

                .home-btn {
                    padding: 12px 24px;
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    margin-top: 20px;
                }

                .home-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                }
            `}</style>
        </div>
    );
}