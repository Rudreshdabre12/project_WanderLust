"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ListingFormData = {
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    location: string;
    country: string;
};

export default function EditListing({ params }: { params: { id: string } }) {
    const id = params.id;
    const [formData, setFormData] = useState<ListingFormData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await axios.post("/api/listings/show", { id });
                setFormData({
                    title: response.data.title,
                    description: response.data.description,
                    imageUrl: response.data.image.url,
                    price: response.data.price,
                    location: response.data.location,
                    country: response.data.country,
                });
                setImagePreview(response.data.image.url);
            } catch (err: any) {
                setError("Error fetching listing: " + err.message);
            }
        };
        fetchListing();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            if (!prevData) return null;
            return {
                ...prevData,
                [name]: name === "price" ? Number(value) : value,
            };
        });
    };

    const handleFileSelect = (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            setError("File size must be less than 10MB");
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError("Please select an image file");
            return;
        }

        setSelectedFile(file);
        setError(null);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const uploadToCloudinary = async (): Promise<string | null> => {
        if (!selectedFile) return null;

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            const signatureResponse = await axios.get('/api/listings/uploadPhoto');
            const { signature, timestamp, cloudName, apiKey } = signatureResponse.data;
            
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp.toString());
            formData.append('api_key', apiKey);
            formData.append('folder', 'listings');

            const uploadResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadProgress(progress);
                        }
                    }
                }
            );

            return uploadResponse.data.secure_url;
        } catch (err: any) {
            console.error('Cloudinary upload error:', err);
            setError(err.response?.data?.error?.message || 'Upload failed');
            return null;
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        try {
            let updatedImageUrl = formData.imageUrl;
            
            // Create FormData object
            const formDataToSend = new FormData();
            formDataToSend.append('id', id);
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price.toString());
            formDataToSend.append('location', formData.location);
            formDataToSend.append('country', formData.country);
            formDataToSend.append('imageUrl', updatedImageUrl);
            
            // Append the file if it exists
            if (selectedFile) {
                formDataToSend.append('imageFile', selectedFile);
            }

            await axios.put("/api/listings/edit", formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            setSuccess("Listing updated successfully!");
            router.push('/home');
        } catch (err: any) {
            setError("Error updating listing: " + err.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(120deg, #1a1c2e, #4b1248)',
            padding: '40px 20px',
            boxSizing: 'border-box',
            color: '#fff'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '30px',
                borderRadius: '20px',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transition: 'all 0.3s ease'
            }}>
                <h1 style={{
                    fontSize: '36px',
                    fontWeight: '800',
                    background: 'linear-gradient(to right, #00dbde, #fc00ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '30px',
                    textAlign: 'center',
                    letterSpacing: '2px'
                }}>Edit Your Listing</h1>

                {success && (
                    <div style={{
                        padding: '15px',
                        borderRadius: '10px',
                        background: 'rgba(0, 255, 0, 0.1)',
                        border: '1px solid rgba(0, 255, 0, 0.2)',
                        color: '#00ff00',
                        textAlign: 'center',
                        marginBottom: '20px',
                        animation: 'fadeIn 0.5s ease'
                    }}>
                        {success}
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '15px',
                        borderRadius: '10px',
                        background: 'rgba(255, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 0, 0, 0.2)',
                        color: '#ff0000',
                        textAlign: 'center',
                        marginBottom: '20px',
                        animation: 'fadeIn 0.5s ease'
                    }}>
                        {error}
                    </div>
                )}

                {formData ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '30px',
                            alignItems: 'start'
                        }}>
                            {/* Left Column - Image Upload */}
                            <div 
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '15px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    border: '2px dashed rgba(255, 255, 255, 0.2)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                }}
                            >
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '400px',
                                    marginBottom: '20px',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                                }}>
                                    {imagePreview && (
                                        <Image
                                            src={imagePreview}
                                            alt="Listing preview"
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            style={{
                                                objectFit: 'cover',
                                                transition: 'transform 0.3s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                (e.target as HTMLElement).style.transform = 'scale(1.05)';
                                            }}
                                            onMouseOut={(e) => {
                                                (e.target as HTMLElement).style.transform = 'scale(1)';
                                            }}
                                        />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    onChange={handleFileInputChange}
                                    accept="image/*"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        padding: '12px 24px',
                                        background: 'linear-gradient(45deg, #00dbde, #fc00ff)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '25px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        transition: 'all 0.3s ease',
                                        transform: 'translateY(0)',
                                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                                    }}
                                >
                                    Change Image
                                </button>
                                {isUploading && (
                                    <div style={{
                                        marginTop: '20px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        padding: '15px',
                                        borderRadius: '10px'
                                    }}>
                                        <p style={{ color: '#fff', marginBottom: '10px' }}>
                                            Uploading: {uploadProgress}%
                                        </p>
                                        <div style={{
                                            width: '100%',
                                            height: '6px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: '3px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${uploadProgress}%`,
                                                height: '100%',
                                                background: 'linear-gradient(45deg, #00dbde, #fc00ff)',
                                                borderRadius: '3px',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Form Fields */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                                animation: 'slideIn 0.5s ease'
                            }}>
                                {[
                                    { name: 'title', label: 'Title', type: 'text' },
                                    { name: 'description', label: 'Description', type: 'textarea' },
                                    { name: 'price', label: 'Price', type: 'number' },
                                    { name: 'location', label: 'Location', type: 'text' },
                                    { name: 'country', label: 'Country', type: 'text' }
                                ].map((field) => (
                                    <div 
                                        key={field.name} 
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            padding: '20px',
                                            borderRadius: '15px',
                                            transition: 'transform 0.3s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '10px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#fff',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {field.label}
                                        </label>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                name={field.name}
                                                value={formData[field.name as keyof ListingFormData]}
                                                onChange={handleChange}
                                                required
                                                rows={4}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '10px',
                                                    color: '#fff',
                                                    fontSize: '16px',
                                                    resize: 'vertical',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            />
                                        ) : (
                                            <input
                                                type={field.type}
                                                name={field.name}
                                                value={formData[field.name as keyof ListingFormData]}
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '10px',
                                                    color: '#fff',
                                                    fontSize: '16px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{
                            marginTop: '30px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '15px'
                        }}>
                            <button
                                type="button"
                                onClick={() => router.push('/home')}
                                style={{
                                    padding: '12px 30px',
                                    background: 'transparent',
                                    color: '#fff',
                                    border: '2px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '25px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease',
                                    transform: 'translateY(0)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{
                                    padding: '12px 30px',
                                    background: 'linear-gradient(45deg, #00dbde, #fc00ff)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '25px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease',
                                    transform: 'translateY(0)',
                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                                }}
                            >
                                Update Listing
                            </button>
                        </div>
                    </form>
                ) : (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '200px'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: '4px solid rgba(255, 255, 255, 0.1)',
                            borderTop: '4px solid #00dbde',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
