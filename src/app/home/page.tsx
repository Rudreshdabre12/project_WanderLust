"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { ClipLoader } from "react-spinners"; 
import Image from 'next/image';

// Constants for available cities and countries
const AVAILABLE_CITIES = [
    "Mumbai", "Delhi", "Bangkok", "Tokyo", "Paris", 
    "London", "New York", "Dubai", "Singapore", "Sydney",
    "Rome", "Barcelona", "Amsterdam", "Berlin", "Venice",
    "Cairo", "Istanbul", "Moscow", "Seoul", "Toronto","Allahabad"
];

const AVAILABLE_COUNTRIES = [
    "India", "Thailand", "Japan", "France", "UK",
    "USA", "UAE", "Singapore", "Australia", "Italy",
    "Spain", "Netherlands", "Germany", "Egypt", "Turkey",
    "Russia", "South Korea", "Canada", "China", "Brazil","United States"
];

export default function HomePage() {
    const router = useRouter();
    const [listings, setListings] = useState<any[] | null>(null);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Filter and sort states
    const [showFilters, setShowFilters] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [maxPrice, setMaxPrice] = useState<number | null>(null);

    // LLM prompt states
    const [showPrompt, setShowPrompt] = useState(false);
    const [promptInput, setPromptInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await axios.get(`/api/listings/home?t=${Date.now()}`);
                setListings(response.data);
            } catch (err: any) {
                console.log("error in fetching listings", err.message);
            } finally {
                setLoading(false); 
            }
        };
        fetchListings();
    }, []);

    // Add a new effect to refresh data when coming from edit page
    useEffect(() => {
        const refreshData = async () => {
            try {
                const response = await axios.get(`/api/listings/home?t=${Date.now()}`);
                setListings(response.data);
            } catch (err: any) {
                console.log("error in refreshing listings", err.message);
            }
        };
        refreshData();
    }, [router]);

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

    // Get unique cities and countries for filter options
    const { cities, countries } = useMemo(() => {
        if (!listings) return { cities: [], countries: [] };
        
        const citiesSet = new Set(listings.map(listing => listing.location));
        const countriesSet = new Set(listings.map(listing => listing.country));
        
        return {
            cities: Array.from(citiesSet).sort(),
            countries: Array.from(countriesSet).sort()
        };
    }, [listings]);

    // Function to process natural language query
    const processNaturalLanguageQuery = async (query: string) => {
        setIsProcessing(true);
        try {
            // Here we'll implement simple keyword matching for demo
            // In a real application, you'd want to use a proper LLM API
            const queryLower = query.toLowerCase();
            
            // Reset all filters first
            setSelectedCity("");
            setSelectedCountry("");
            setMaxPrice(null);
            
            // Process location
            AVAILABLE_CITIES.forEach(city => {
                if (queryLower.includes(city.toLowerCase())) {
                    setSelectedCity(city);
                }
            });
            
            AVAILABLE_COUNTRIES.forEach(country => {
                if (queryLower.includes(country.toLowerCase())) {
                    setSelectedCountry(country);
                }
            });
            
            // Process budget
            const budgetMatch = queryLower.match(/budget (\d+)/);
            if (budgetMatch) {
                setMaxPrice(parseInt(budgetMatch[1]));
            }
            
            // Close prompt box after processing
            setShowPrompt(false);
            setPromptInput("");
        } catch (error) {
            console.error("Error processing query:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Filter and sort listings
    const filteredAndSortedListings = useMemo(() => {
        if (!listings) return [];
        
        let filtered = listings.filter(listing => {
            const cityMatch = !selectedCity || listing.location === selectedCity;
            const countryMatch = !selectedCountry || listing.country === selectedCountry;
            const priceMatch = !maxPrice || listing.price <= maxPrice;
            return cityMatch && countryMatch && priceMatch;
        });

        if (sortBy === "price-low") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
            filtered.sort((a, b) => b.price - a.price);
        }

        return filtered;
    }, [listings, selectedCity, selectedCountry, sortBy, maxPrice]);

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

    const handleBookings = () => {
        router.push('/bookings');
    };

    const clearFilters = () => {
        setSelectedCity("");
        setSelectedCountry("");
        setSortBy("");
    };

    const buttonStyle = {
        padding: '12px 24px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontWeight: '600',
        position: 'relative' as const,
        overflow: 'hidden' as const,
    };

    const filterButtonStyle = {
        ...buttonStyle,
        backgroundColor: showFilters ? '#6366f1' : '#8b5cf6',
        color: 'white',
        background: showFilters 
            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
            : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    };

    const sortButtonStyle = {
        ...buttonStyle,
        backgroundColor: showSort ? '#059669' : '#10b981',
        color: 'white',
        background: showSort 
            ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' 
            : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    };

    const dropdownStyle = {
        position: 'absolute' as const,
        top: '100%',
        left: '0',
        right: '0',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        padding: '20px',
        marginTop: '8px',
        border: '1px solid #e5e7eb',
        backdropFilter: 'blur(10px)',
        animation: 'slideDown 0.3s ease-out',
    };

    return (
        <div style={{ 
            position: 'relative', 
            padding: '40px', 
            backgroundColor: '#f8fafc',  
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
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
                
                .listing-card {
                    animation: fadeInUp 0.6s ease-out;
                    animation-fill-mode: both;
                }
                
                .listing-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                }
                
                .prompt-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                .prompt-box {
                    background: white;
                    padding: 24px;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 500px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>

            {/* Header Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <button
                    onClick={handleHome}
                    style={{
                        ...buttonStyle,
                        backgroundColor: '#6b7280',
                        color: 'white',
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                    }}
                >
                    🏠 Home
                </button>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    {status ? (
                        <>
                            <button
                                onClick={handleCreate}
                                style={{
                                    ...buttonStyle,
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    color: 'white',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                                }}
                            >
                                ✨ Create
                            </button>
                            <button
                                onClick={handleBookings}
                                style={{
                                    ...buttonStyle,
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                    color: 'white',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                                }}
                            >
                                📅 My Bookings
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    ...buttonStyle,
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                                }}
                            >
                                🚪 Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleLogin}
                                style={{
                                    ...buttonStyle,
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    color: 'white',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                                }}
                            >
                                🔑 Login
                            </button>
                            <button
                                onClick={handleSignup}
                                style={{
                                    ...buttonStyle,
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                                }}
                            >
                                📝 Signup
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filter and Sort Controls */}
            <div style={{ 
                display: 'flex', 
                gap: '20px', 
                marginBottom: '30px', 
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                {/* Filters Button */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={filterButtonStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                        }}
                    >
                        🔍 Filters {(selectedCity || selectedCountry) && '●'}
                    </button>
                    
                    {showFilters && (
                        <div style={dropdownStyle}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
                                Filter Listings
                            </h3>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: '500' }}>
                                    City:
                                </label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '14px',
                                        transition: 'border-color 0.3s',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                                >
                                    <option value="">All Cities</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: '500' }}>
                                    Country:
                                </label>
                                <select
                                    value={selectedCountry}
                                    onChange={(e) => setSelectedCountry(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '14px',
                                        transition: 'border-color 0.3s',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                                >
                                    <option value="">All Countries</option>
                                    {countries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <button
                                onClick={clearFilters}
                                style={{
                                    ...buttonStyle,
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    color: 'white',
                                    fontSize: '14px',
                                    padding: '10px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                🗑️ Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Sort Button */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowSort(!showSort)}
                        style={sortButtonStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                        }}
                    >
                        📊 Sort By {sortBy && '●'}
                    </button>
                    
                    {showSort && (
                        <div style={dropdownStyle}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
                                Sort by Price
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button
                                    onClick={() => {
                                        setSortBy("price-low");
                                        setShowSort(false);
                                    }}
                                    style={{
                                        ...buttonStyle,
                                        background: sortBy === "price-low" 
                                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                                            : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                        color: sortBy === "price-low" ? 'white' : '#374151',
                                        fontSize: '14px',
                                        padding: '10px',
                                        textAlign: 'left' as const
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    💰 Price: Low to High
                                </button>
                                
                                <button
                                    onClick={() => {
                                        setSortBy("price-high");
                                        setShowSort(false);
                                    }}
                                    style={{
                                        ...buttonStyle,
                                        background: sortBy === "price-high" 
                                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                                            : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                        color: sortBy === "price-high" ? 'white' : '#374151',
                                        fontSize: '14px',
                                        padding: '10px',
                                        textAlign: 'left' as const
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    💎 Price: High to Low
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '16px', fontWeight: '500' }}>
                    {filteredAndSortedListings.length} listing{filteredAndSortedListings.length !== 1 ? 's' : ''} found
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                    <ClipLoader size={80} color={"#8b5cf6"} loading={loading} />
                </div>
            ) : (
                /* Listings Grid */
                filteredAndSortedListings.length > 0 ? (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '25px', 
                        justifyContent: 'center',
                        maxWidth: '1600px',
                        margin: '0 auto'
                    }}>
                        {filteredAndSortedListings.map((listing, index) => (
                            <div
                                key={listing._id}
                                className="listing-card"
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid #f1f5f9',
                                    animationDelay: `${index * 0.1}s`,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                onClick={() => handleClick(listing._id)}
                            >
                                <div style={{ position: 'relative', overflow: 'hidden', height: '220px' }}>
                                    <Image
                                        src={listing.image.url}
                                        alt={listing.title}
                                        fill
                                        priority={index <= 5}
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1600px) 33vw, 25vw"
                                        style={{
                                            objectFit: 'cover',
                                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                        onMouseOver={(e: any) => e.target.style.transform = 'scale(1.1)'}
                                        onMouseOut={(e: any) => e.target.style.transform = 'scale(1)'}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '20px',
                                        padding: '6px 12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#059669',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        ${listing.price}
                                    </div>
                                </div>
                                
                                <div style={{ padding: '20px' }}>
                                    <h2 style={{ 
                                        fontSize: '22px', 
                                        margin: '0 0 8px 0', 
                                        color: '#1f2937', 
                                        fontWeight: '700',
                                        lineHeight: '1.3'
                                    }}>
                                        {listing.title}
                                    </h2>
                                    <p style={{ 
                                        fontSize: '15px', 
                                        color: '#6b7280', 
                                        marginBottom: '12px',
                                        lineHeight: '1.5',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {listing.description}
                                    </p>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#8b5cf6',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}>
                                        📍 {listing.location}, {listing.country}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ 
                        textAlign: 'center', 
                        color: '#6b7280', 
                        fontSize: '18px',
                        padding: '60px 20px',
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>No listings found</h3>
                        <p style={{ margin: 0 }}>Try adjusting your filters or search criteria.</p>
                    </div>
                )
            )}

            {/* LLM Prompt Button */}
            <button
                onClick={() => setShowPrompt(true)}
                style={{
                    ...buttonStyle,
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    color: 'white',
                    zIndex: 900,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 28px',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                }}
            >
                🤖 Ask AI Assistant
            </button>

            {/* LLM Prompt Modal */}
            {showPrompt && (
                <div className="prompt-overlay" onClick={() => setShowPrompt(false)}>
                    <div className="prompt-box" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '20px' }}>
                            Ask AI Assistant
                        </h3>
                        <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '14px' }}>
                            Tell me your travel preferences (e.g., &quot;I want to go to India with budget 6000&quot;)
                        </p>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={promptInput}
                                onChange={(e) => setPromptInput(e.target.value)}
                                placeholder="Where would you like to go?"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    paddingRight: '120px',
                                    borderRadius: '8px',
                                    border: '2px solid #e5e7eb',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'all 0.3s'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && promptInput.trim()) {
                                        processNaturalLanguageQuery(promptInput);
                                    }
                                }}
                            />
                            <button
                                onClick={() => promptInput.trim() && processNaturalLanguageQuery(promptInput)}
                                disabled={isProcessing || !promptInput.trim()}
                                style={{
                                    position: 'absolute',
                                    right: '4px',
                                    top: '4px',
                                    background: isProcessing ? '#9ca3af' : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 16px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '14px',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {isProcessing ? (
                                    <>
                                        <ClipLoader size={14} color={"#ffffff"} />
                                        Processing...
                                    </>
                                ) : (
                                    <>🔍 Search</>
                                )}
                            </button>
                        </div>
                        <div style={{ 
                            marginTop: '16px',
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{ color: '#6b7280', fontSize: '14px' }}>Try asking about:</span>
                            {['India', 'Paris', 'budget 5000', 'Tokyo'].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setPromptInput(suggestion)}
                                    style={{
                                        background: '#f3f4f6',
                                        border: 'none',
                                        borderRadius: '20px',
                                        padding: '4px 12px',
                                        fontSize: '14px',
                                        color: '#4b5563',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#e5e7eb';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#f3f4f6';
                                    }}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}