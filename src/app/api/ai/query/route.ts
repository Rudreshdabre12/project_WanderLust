import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import axios from 'axios';
import Listing from "@/models/listings";

connect();

// Helper to parse address components from Google Geocoding API
const getAddressComponent = (components: any[], type: string) => {
    return components.find(component => component.types.includes(type))?.long_name || "";
};

// Helper to extract preferences from user query
const extractPreferences = (query: string) => {
    const queryLower = query.toLowerCase();
    
    // Extract budget
    const priceMatch = queryLower.match(/(?:budget|under|less than|price of|max price|upto) \$?(\d+)/);
    const budget = priceMatch ? parseInt(priceMatch[1], 10) : null;

    // Extract activity preferences
    const activities = {
        beach: /beach|sea|ocean|coastal|swimming/i.test(query),
        mountain: /mountain|hiking|trek|climbing|hills/i.test(query),
        city: /city|urban|metropolitan|downtown/i.test(query),
        nature: /nature|wildlife|forest|park|outdoor/i.test(query),
        culture: /culture|historic|museum|art|traditional/i.test(query),
        adventure: /adventure|extreme|sport|thrill/i.test(query),
        relaxation: /relax|peaceful|quiet|calm|spa/i.test(query)
    };

    // Extract climate preferences
    const climate = {
        warm: /warm|hot|sunny|tropical/i.test(query),
        cold: /cold|snow|winter|cool/i.test(query),
        moderate: /moderate|mild|pleasant/i.test(query)
    };

    return { budget, activities, climate };
};

// Helper to validate listing data
const validateListing = (listing: any) => {
    return {
        _id: listing._id || '',
        title: listing.title || 'Untitled Property',
        description: listing.description || 'No description available',
        image: {
            url: listing.image?.url || 'https://images.unsplash.com/photo-1455587734955-081b22074882?ixlib=rb-4.0.3&ixid=M3wxMA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80'
        },
        price: listing.price || 0,
        location: listing.location || 'Unknown Location',
        country: listing.country || 'Unknown Country',
        score: listing.score || 0
    };
};

// Helper to generate recommendation message
const generateRecommendation = (listings: any[], preferences: any) => {
    let message = "";
    const { budget, activities, climate } = preferences;

    // Filter listings based on preferences
    let filteredListings = [...listings].filter(listing => {
        // Basic validation of listing data
        return listing && typeof listing === 'object';
    });
    
    if (budget) {
        filteredListings = filteredListings.filter(listing => listing.price <= budget);
    }

    // Sort by relevance to activities and climate
    filteredListings = filteredListings.map(listing => {
        let score = 0;
        const description = (listing.description || '').toLowerCase();
        const title = (listing.title || '').toLowerCase();

        // Score based on activities
        Object.entries(activities).forEach(([activity, isPreferred]) => {
            if (isPreferred && (description.includes(activity) || title.includes(activity))) {
                score += 2;
            }
        });

        // Score based on climate
        Object.entries(climate).forEach(([type, isPreferred]) => {
            if (isPreferred && (description.includes(type) || title.includes(type))) {
                score += 1;
            }
        });

        return { ...listing, score };
    }).sort((a, b) => b.score - a.score);

    // Generate recommendation message
    if (filteredListings.length === 0) {
        message = "I couldn't find any places matching your exact preferences. Consider adjusting your criteria, such as increasing your budget or exploring different locations.";
    } else {
        const topRecommendations = filteredListings.slice(0, 3);
        
        message = "Based on your preferences, I recommend:\n\n";
        topRecommendations.forEach((listing, index) => {
            const validatedListing = validateListing(listing);
            message += `${index + 1}. ${validatedListing.title} in ${validatedListing.location}, ${validatedListing.country}\n`;
            message += `   • ${validatedListing.description}\n`;
            message += `   • Price: $${validatedListing.price} per night\n\n`;
        });

        // Add personalized tips
        if (budget) {
            message += `💡 Tip: With your budget of $${budget}, you can also explore `;
            message += filteredListings.length > 3 
                ? `${filteredListings.length - 3} other options in similar price ranges.\n\n`
                : "other destinations by adjusting your dates or location preferences.\n\n";
        }

        // Add activity-based suggestions
        const preferredActivities = Object.entries(activities)
            .filter(([_, isPreferred]) => isPreferred)
            .map(([activity]) => activity);
        
        if (preferredActivities.length > 0) {
            message += "🎯 Activities you might enjoy in these locations:\n";
            preferredActivities.forEach(activity => {
                message += `   • ${activity.charAt(0).toUpperCase() + activity.slice(1)} activities\n`;
            });
        }
    }

    // Validate all recommendations before returning
    const validatedRecommendations = filteredListings.slice(0, 3).map(validateListing);

    return { message, recommendations: validatedRecommendations };
};

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { query } = reqBody;

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        // Extract user preferences
        const preferences = extractPreferences(query);
        
        // Get all listings from database
        const allListings = await Listing.find({});

        // Generate recommendations
        const { message, recommendations } = generateRecommendation(allListings, preferences);

        // Try to get location information if present in query
        let foundCity = "";
        let foundCountry = "";
        
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (apiKey) {
            try {
                const locationQuery = query.replace(/(?:budget|under|less than|price of|max price|upto) \$?(\d+)/i, '').trim();
                if (locationQuery) {
                    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json`;
                    const response = await axios.get(geocodingUrl, {
                        params: {
                            address: locationQuery,
                            key: apiKey,
                        },
                    });
    
                    if (response.data.status === 'OK' && response.data.results.length > 0) {
                        const components = response.data.results[0].address_components;
                        foundCity = getAddressComponent(components, 'locality') || 
                                  getAddressComponent(components, 'administrative_area_level_1');
                        foundCountry = getAddressComponent(components, 'country');
                    }
                }
            } catch (apiError: any) {
                console.error("Error calling Google Geocoding API:", apiError.message);
            }
        }

        return NextResponse.json({
            message,
            recommendations,
            city: foundCity,
            country: foundCountry,
            maxPrice: preferences.budget
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 