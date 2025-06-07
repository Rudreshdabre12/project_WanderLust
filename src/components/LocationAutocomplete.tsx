import React, { useEffect, useRef, useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';

interface LocationAutocompleteProps {
    onLocationSelect: (location: { city: string; country: string; }) => void;
    placeholder?: string;
    initialValue?: string;
    className?: string;
}

const libraries: ["places"] = ["places"];

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
    onLocationSelect,
    placeholder = "Enter a location",
    initialValue = "",
    className = ""
}) => {
    const [inputValue, setInputValue] = useState(initialValue);
    const [error, setError] = useState<string | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load Google Maps script
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    // Handle manual input when Google Maps is not available
    const handleManualInput = (value: string) => {
        setInputValue(value);
        const parts = value.split(',').map(part => part.trim());
        const city = parts[0] || '';
        const country = parts[1] || '';
        onLocationSelect({ city, country });
    };

    useEffect(() => {
        // Reset error state when dependencies change
        setError(null);

        if (!isLoaded || loadError || !inputRef.current) {
            if (loadError) {
                console.warn('Google Maps failed to load:', loadError);
                setError('Location service is currently unavailable. You can still enter location manually.');
            }
            return;
        }

        const initialize = async () => {
            try {
                const input = inputRef.current;
                if (!input) return;

                // Create the autocomplete instance
                const autocomplete = new google.maps.places.Autocomplete(input, {
                    types: ['(cities)'],
                    fields: ['address_components']
                });

                // Store the autocomplete instance
                autocompleteRef.current = autocomplete;

                // Add event listener for place selection
                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place && place.address_components) {
                        let city = '';
                        let country = '';

                        for (const component of place.address_components) {
                            if (component.types.includes('locality') || 
                                (component.types.includes('administrative_area_level_1') && !city)) {
                                city = component.long_name;
                            }
                            if (component.types.includes('country')) {
                                country = component.long_name;
                            }
                        }

                        if (city || country) {
                            onLocationSelect({ city, country });
                            const displayValue = `${city}${country ? `, ${country}` : ''}`;
                            setInputValue(displayValue);
                            if (input) {
                                input.value = displayValue;
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error initializing Google Maps Autocomplete:', error);
                setError('Location service encountered an error. You can still enter location manually.');
            }
        };

        initialize().catch(error => {
            console.error('Error in initialize:', error);
            setError('Failed to initialize location service. You can still enter location manually.');
        });

        // Cleanup
        return () => {
            if (autocompleteRef.current) {
                google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, [isLoaded, loadError, onLocationSelect]);

    // Common input styles
    const inputStyles = {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '2px solid #e5e7eb',
        fontSize: '16px',
        outline: 'none',
        transition: 'all 0.3s'
    };

    // Error message styles
    const errorStyles = {
        color: '#dc2626',
        fontSize: '14px',
        marginTop: '4px'
    };

    // If Google Maps failed to load or there's an error, show manual input
    if (loadError || error) {
        return (
            <div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleManualInput(e.target.value)}
                    placeholder={`${placeholder} (City, Country)`}
                    className={className}
                    style={inputStyles}
                />
                {error && (
                    <div style={errorStyles}>
                        {error}
                    </div>
                )}
            </div>
        );
    }

    // Show loading state
    if (!isLoaded) {
        return (
            <input
                type="text"
                value={inputValue}
                disabled
                placeholder="Loading location service..."
                className={className}
                style={{
                    ...inputStyles,
                    backgroundColor: '#f3f4f6',
                    cursor: 'wait'
                }}
            />
        );
    }

    // Show the Google Maps Autocomplete input
    return (
        <div>
            <input
                ref={inputRef}
                type="text"
                defaultValue={inputValue}
                placeholder={placeholder}
                className={className}
                style={inputStyles}
                onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
        </div>
    );
};

export default LocationAutocomplete; 