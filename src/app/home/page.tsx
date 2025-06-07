"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { ClipLoader } from "react-spinners"; 
import Image from 'next/image';
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
    const router = useRouter();
    const [listings, setListings] = useState<any[] | null>(null);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [cacheStatus, setCacheStatus] = useState<'HIT' | 'MISS' | 'INVALIDATED' | 'ERROR' | null>(null);
    const [error, setError] = useState<string | null>(null);
    
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
    const [aiResponse, setAiResponse] = useState<{ message: string; recommendations: any[] } | null>(null);

    const fetchListings = async (invalidateCache = false) => {
        try {
            setError(null); // Clear any previous errors
            const url = `/api/listings/home?t=${Date.now()}${invalidateCache ? '&invalidate=true' : ''}`;
            const response = await axios.get(url);
            setListings(response.data);
            setCacheStatus(response.headers['x-cache'] as 'HIT' | 'MISS' | 'INVALIDATED');
        } catch (err: any) {
            console.error("Error fetching listings:", err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch listings');
            setCacheStatus('ERROR');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchListings();
    }, []);

    // Refresh data when coming from edit page
    useEffect(() => {
        const refreshData = () => {
            fetchListings(true); // Invalidate cache when refreshing after edit
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
            const response = await axios.post('/api/ai/query', { query });
            const { message, recommendations, city, country, maxPrice } = response.data;

            setAiResponse({ message, recommendations });
            
            // Update filters if location or price is specified
            if (city) setSelectedCity(city);
            if (country) setSelectedCountry(country);
            if (maxPrice) setMaxPrice(maxPrice);
            
            setPromptInput("");
        } catch (error) {
            console.error("Error processing query:", error);
            setAiResponse({
                message: "Sorry, I encountered an error while processing your request. Please try again.",
                recommendations: []
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle location selection from autocomplete
    const handleLocationSelect = ({ city, country }: { city: string; country: string }) => {
        setSelectedCity(city);
        setSelectedCountry(country);
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
        padding: '12px 24px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontWeight: '600',
        background: 'white',
        color: '#4b5563',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        position: 'relative' as const,
    };

    const activeFilterCount = [
        selectedCity && 'Location',
        maxPrice && 'Price',
        sortBy && 'Sort'
    ].filter(Boolean).length;

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

            {/* Cache Status and Error Display */}
            <div style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
            }}>
                {/* Cache Status */}
                {cacheStatus && (
                    <div style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500',
                        background: cacheStatus === 'HIT' ? '#10b981' : 
                                   cacheStatus === 'MISS' ? '#6366f1' :
                                   cacheStatus === 'INVALIDATED' ? '#f59e0b' : '#ef4444',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        {cacheStatus === 'HIT' && '🚀 Served from cache'}
                        {cacheStatus === 'MISS' && '🔄 Fresh data'}
                        {cacheStatus === 'INVALIDATED' && '♻️ Cache refreshed'}
                        {cacheStatus === 'ERROR' && '⚠️ Cache error'}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        maxWidth: '90vw',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <span style={{ fontSize: '16px' }}>⚠️</span>
                        {error}
                    </div>
                )}
            </div>

            {/* Filter Controls */}
            <div style={{ 
                marginBottom: '30px',
                position: 'sticky',
                top: '20px',
                zIndex: 40,
                background: 'rgba(248, 250, 252, 0.8)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {/* Filters Button */}
                        <motion.button
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                ...filterButtonStyle,
                                background: showFilters ? '#f3f4f6' : 'white',
                            }}
                            whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span style={{ 
                                fontSize: '20px',
                                marginRight: '4px'
                            }}>
                                🔍
                            </span>
                            Filters
                            {activeFilterCount > 0 && (
                                <span style={{
                                    background: '#8b5cf6',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    marginLeft: '4px'
                                }}>
                                    {activeFilterCount}
                                </span>
                            )}
                        </motion.button>

                        {/* Sort Button */}
                        <motion.button
                            onClick={() => setShowSort(!showSort)}
                            style={{
                                ...filterButtonStyle,
                                background: showSort ? '#f3f4f6' : 'white',
                            }}
                            whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span style={{ fontSize: '20px' }}>📊</span>
                            Sort
                            {sortBy && (
                                <span style={{
                                    background: '#10b981',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px'
                                }} />
                            )}
                        </motion.button>

                        {/* Active Filters Display */}
                        {(selectedCity || maxPrice || sortBy) && (
                            <div style={{ 
                                display: 'flex', 
                                gap: '8px', 
                                alignItems: 'center',
                                flexWrap: 'wrap'
                            }}>
                                {selectedCity && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            background: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        📍 {selectedCity}
                                        <button
                                            onClick={() => setSelectedCity("")}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                padding: '0',
                                                cursor: 'pointer',
                                                fontSize: '16px',
                                                color: '#9ca3af'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </motion.div>
                                )}
                                {maxPrice && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            background: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        💰 Under ${maxPrice}
                                        <button
                                            onClick={() => setMaxPrice(null)}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                padding: '0',
                                                cursor: 'pointer',
                                                fontSize: '16px',
                                                color: '#9ca3af'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </motion.div>
                                )}
                                {sortBy && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            background: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        {sortBy === 'price-low' ? '↑ Price: Low to High' : '↓ Price: High to Low'}
                                        <button
                                            onClick={() => setSortBy("")}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                padding: '0',
                                                cursor: 'pointer',
                                                fontSize: '16px',
                                                color: '#9ca3af'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Results Count */}
                    <div style={{ 
                        color: '#6b7280', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        background: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #e5e7eb'
                    }}>
                        {filteredAndSortedListings.length} listing{filteredAndSortedListings.length !== 1 ? 's' : ''} found
                    </div>
                </div>

                {/* Filters Dropdown */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: '0',
                                right: '0',
                                background: 'white',
                                padding: '24px',
                                borderRadius: '16px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                marginTop: '12px',
                                border: '1px solid #e5e7eb',
                                zIndex: 50
                            }}
                        >
                            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
                                {/* Location Filter */}
                                <div>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '8px', 
                                        color: '#374151', 
                                        fontWeight: '600',
                                        fontSize: '14px'
                                    }}>
                                        Location
                                    </label>
                                    <LocationAutocomplete
                                        onLocationSelect={({ city, country }) => {
                                            setSelectedCity(city);
                                            setSelectedCountry(country);
                                        }}
                                        placeholder="Enter city or country"
                                        initialValue={selectedCity}
                                    />
                                </div>

                                {/* Price Filter */}
                                <div>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '8px', 
                                        color: '#374151', 
                                        fontWeight: '600',
                                        fontSize: '14px'
                                    }}>
                                        Maximum Price
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#6b7280',
                                            fontSize: '16px'
                                        }}>
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            value={maxPrice || ''}
                                            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                                            placeholder="Enter maximum price"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                paddingLeft: '28px',
                                                borderRadius: '8px',
                                                border: '2px solid #e5e7eb',
                                                fontSize: '16px',
                                                outline: 'none',
                                                transition: 'all 0.3s'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Clear Filters Button */}
                            {(selectedCity || maxPrice) && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={clearFilters}
                                    style={{
                                        marginTop: '20px',
                                        padding: '8px 16px',
                                        background: '#f3f4f6',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#4b5563',
                                        fontSize: '14px',
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
                                    Clear all filters
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Sort Dropdown */}
                <AnimatePresence>
                    {showSort && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: '0',
                                right: '0',
                                background: 'white',
                                padding: '16px',
                                borderRadius: '16px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                marginTop: '12px',
                                border: '1px solid #e5e7eb',
                                zIndex: 50
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { value: 'price-low', label: 'Price: Low to High', icon: '↑' },
                                    { value: 'price-high', label: 'Price: High to Low', icon: '↓' }
                                ].map((option) => (
                                    <motion.button
                                        key={option.value}
                                        onClick={() => {
                                            setSortBy(option.value);
                                            setShowSort(false);
                                        }}
                                        style={{
                                            padding: '12px',
                                            background: sortBy === option.value ? '#f3f4f6' : 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            width: '100%',
                                            textAlign: 'left',
                                            color: '#4b5563',
                                            fontSize: '14px',
                                            fontWeight: sortBy === option.value ? '600' : '400'
                                        }}
                                        whileHover={{
                                            backgroundColor: '#f3f4f6'
                                        }}
                                    >
                                        <span style={{ fontSize: '16px' }}>{option.icon}</span>
                                        {option.label}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                            Ask AI Travel Assistant
                        </h3>
                        <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '14px' }}>
                            Tell me about your travel preferences (e.g., &quot;I want a beach vacation with adventure activities under $2000&quot; or &quot;Looking for a peaceful mountain retreat&quot;)
                        </p>
                        
                        {/* AI Response Section */}
                        {aiResponse && (
                            <div style={{
                                marginBottom: '20px',
                                padding: '16px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{
                                    whiteSpace: 'pre-line',
                                    color: '#4b5563',
                                    fontSize: '14px',
                                    lineHeight: '1.6'
                                }}>
                                    {aiResponse.message}
                                </div>
                                
                                {aiResponse.recommendations.length > 0 && (
                                    <div style={{
                                        marginTop: '16px',
                                        display: 'flex',
                                        gap: '12px',
                                        overflowX: 'auto',
                                        padding: '4px'
                                    }}>
                                        {aiResponse.recommendations.map((listing, index) => (
                                            <div
                                                key={listing._id}
                                                onClick={() => handleClick(listing._id)}
                                                style={{
                                                    flex: '0 0 280px',
                                                    background: 'white',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    border: '1px solid #e5e7eb',
                                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <div style={{ position: 'relative', height: '160px' }}>
                                                    <Image
                                                        src={listing.image?.url || 'https://images.unsplash.com/photo-1455587734955-081b22074882?ixlib=rb-4.0.3&ixid=M3wxMA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80'}
                                                        alt={listing.title || 'Property Image'}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <div style={{ padding: '12px' }}>
                                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1f2937' }}>
                                                        {listing.title || 'Untitled Property'}
                                                    </h4>
                                                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
                                                        {listing.location && listing.country ? `${listing.location}, ${listing.country}` : 'Location not specified'}
                                                    </p>
                                                    <p style={{ margin: '0', fontSize: '14px', color: '#059669', fontWeight: '600' }}>
                                                        ${listing.price || 0}/night
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={promptInput}
                                onChange={(e) => setPromptInput(e.target.value)}
                                placeholder="What kind of vacation are you looking for?"
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
                                    <>🤖 Ask AI</>
                                )}
                            </button>
                        </div>

                        {/* Example queries */}
                        <div style={{ 
                            marginTop: '16px',
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{ color: '#6b7280', fontSize: '14px' }}>Try asking about:</span>
                            {[
                                "Beach vacation with water sports",
                                "Peaceful mountain retreat",
                                "Cultural city experience under $1500",
                                "Tropical paradise for relaxation"
                            ].map((suggestion) => (
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

            {/* Refresh Button */}
            <motion.button
                onClick={() => fetchListings(true)}
                style={{
                    position: 'fixed',
                    bottom: '90px', // Position above the AI Assistant button
                    right: '30px',
                    background: 'white',
                    color: '#4b5563',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    zIndex: 900
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)' }}
                whileTap={{ scale: 0.95 }}
            >
                🔄 Refresh Data
            </motion.button>

            <style jsx global>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}