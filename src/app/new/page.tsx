"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface FormData {
    title: string;
    description: string;
    image: {
        url: string;
        filename: string;
    };
    price: number;
    location: string;
    country: string;
}

export default function AddListingForm() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        image: {
            url: "",
            filename: "listingimage",
        },
        price: 0,
        location: "",
        country: ""
    });
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: name === "price" ? Number(value) : value
        }));
    };

    const handleFileSelect = (file: File) => {
        if (file.size > 10 * 1024 * 1024) { // Increased to 10MB for Cloudinary
            setError("File size must be less than 10MB");
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError("Please select an image file");
            return;
        }

        setSelectedFile(file);
        setError(null);
        
        // Create preview
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

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileSelect(files[0]);
        }
    };

    const uploadToCloudinary = async (): Promise<{ url: string; filename: string } | null> => {
        if (!selectedFile) return null;

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            // Get upload signature from your API
            const signatureResponse = await axios.get('/api/listings/uploadPhoto');
            const { signature, timestamp, cloudName, apiKey } = signatureResponse.data;
            
            // Prepare form data for Cloudinary
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp.toString());
            formData.append('api_key', apiKey);
            formData.append('folder', 'listings'); // Optional: organize in folders

            // Upload directly to Cloudinary
            const uploadResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadProgress(progress);
                        }
                    }
                }
            );

            return {
                url: uploadResponse.data.secure_url,
                filename: uploadResponse.data.public_id
            };

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
        setIsSubmitting(true);
        setError(null);

        try {
            // Upload image first if selected
            let imageData = formData.image;
            if (selectedFile) {
                const uploadedImage = await uploadToCloudinary();
                if (!uploadedImage) {
                    setIsSubmitting(false);
                    return;
                }
                imageData = uploadedImage;
            }

            const userDataResponse = await axios.post("/api/users/getTokenData");
            const userId = userDataResponse?.data?.data?.id;

            if (!userId) {
                throw new Error("User ID not found");
            }

            const payload = {
                ...formData,
                image: imageData,
                user: {
                    data: {
                        data: {
                            id: userId
                        }
                    }
                }
            };

            const response = await axios.post("/api/listings/new", payload);
            setSuccess("Listing added successfully!");
            
            // Reset form
            setFormData({
                title: "",
                description: "",
                image: { url: "", filename: "listingimage" },
                price: 0,
                location: "",
                country: ""
            });
            setSelectedFile(null);
            setImagePreview("");
            
            setTimeout(() => {
                router.push("/home");
            }, 2000);
            
        } catch (err: any) {
            setError("Error adding listing: " + (err.response?.data?.error || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeImage = () => {
        setSelectedFile(null);
        setImagePreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Animated Background Elements */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `
                    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)
                `,
                animation: 'float 6s ease-in-out infinite'
            }} />

            <div style={{
                padding: '40px 20px',
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: '800px',
                        marginBottom: '30px'
                    }}
                >
                    <h2 style={{ 
                        color: '#fff', 
                        fontWeight: 700, 
                        fontSize: '32px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        margin: 0
                    }}>
                        Create Listing
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/home')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        ← Home
                    </motion.button>
                </motion.div>

                {/* Main Form Container */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{
                        maxWidth: '800px',
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        padding: '40px',
                        borderRadius: '24px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                >
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            textAlign: 'center',
                            marginBottom: '40px',
                            fontSize: '36px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 700,
                            letterSpacing: '-1px'
                        }}
                    >
                        Add New Listing
                    </motion.h1>

                    {/* Success/Error Messages */}
                    <AnimatePresence>
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                style={{
                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                    color: 'white',
                                    padding: '16px 24px',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)'
                                }}
                            >
                                ✓ {success}
                            </motion.div>
                        )}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                style={{
                                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
                                    color: 'white',
                                    padding: '16px 24px',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
                                }}
                            >
                                ⚠ {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* Form Fields Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            {[
                                { label: "Title", name: "title", type: "text", placeholder: "Enter an amazing title", icon: "📝" },
                                { label: "Price", name: "price", type: "number", placeholder: "Enter price", icon: "💰" },
                                { label: "Location", name: "location", type: "text", placeholder: "Enter location", icon: "📍" },
                                { label: "Country", name: "country", type: "text", placeholder: "Enter country", icon: "🌍" }
                            ].map(({ label, name, type, placeholder, icon }, index) => (
                                <motion.div
                                    key={name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '12px', 
                                        fontWeight: 600, 
                                        color: '#4a5568',
                                        fontSize: '16px'
                                    }}>
                                        <span style={{ marginRight: '8px' }}>{icon}</span>
                                        {label}
                                    </label>
                                    <input
                                        type={type}
                                        name={name}
                                        value={(formData as any)[name]}
                                        onChange={handleChange}
                                        required
                                        placeholder={placeholder}
                                        style={{
                                            width: '100%',
                                            padding: '16px 20px',
                                            borderRadius: '12px',
                                            border: '2px solid #e2e8f0',
                                            outline: 'none',
                                            fontSize: '16px',
                                            transition: 'all 0.3s ease',
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.border = '2px solid #667eea';
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.border = '2px solid #e2e8f0';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Description Field */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '12px', 
                                fontWeight: 600, 
                                color: '#4a5568',
                                fontSize: '16px'
                            }}>
                                <span style={{ marginRight: '8px' }}>📄</span>
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Describe your listing in detail..."
                                style={{
                                    width: '100%',
                                    padding: '16px 20px',
                                    borderRadius: '12px',
                                    border: '2px solid #e2e8f0',
                                    outline: 'none',
                                    fontSize: '16px',
                                    transition: 'all 0.3s ease',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    minHeight: '120px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.border = '2px solid #667eea';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.border = '2px solid #e2e8f0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </motion.div>

                        {/* Image Upload Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '12px', 
                                fontWeight: 600, 
                                color: '#4a5568',
                                fontSize: '16px'
                            }}>
                                <span style={{ marginRight: '8px' }}>🖼️</span>
                                Upload Image
                            </label>
                            
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                style={{
                                    border: `2px dashed ${dragActive ? '#667eea' : '#cbd5e0'}`,
                                    borderRadius: '16px',
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    background: dragActive ? 'rgba(102, 126, 234, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInputChange}
                                    style={{ display: 'none' }}
                                />
                                
                                {!imagePreview ? (
                                    <div>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
                                        <p style={{ fontSize: '18px', fontWeight: 600, color: '#4a5568', margin: '0 0 8px 0' }}>
                                            Drop your image here or click to browse
                                        </p>
                                        <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
                                            Maximum file size: 10MB (JPG, PNG, GIF)
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '300px',
                                                borderRadius: '12px',
                                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeImage();
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                backdropFilter: 'blur(10px)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                fontSize: '18px',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                            }}
                                        >
                                            ✕
                                        </motion.button>
                                    </div>
                                )}
                            </div>

                            {/* Upload Progress Bar */}
                            {isUploading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        marginTop: '16px',
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{
                                        background: '#e2e8f0',
                                        borderRadius: '8px',
                                        height: '8px',
                                        overflow: 'hidden',
                                        marginBottom: '8px'
                                    }}>
                                        <div
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                height: '100%',
                                                width: `${uploadProgress}%`,
                                                transition: 'width 0.3s ease',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </div>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#4a5568' }}>
                                        Uploading... {uploadProgress}%
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting || isUploading}
                            style={{
                                padding: '20px 40px',
                                background: isSubmitting || isUploading 
                                    ? 'linear-gradient(135deg, #a0a0a0 0%, #808080 100%)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: isSubmitting || isUploading ? 'not-allowed' : 'pointer',
                                fontSize: '18px',
                                fontWeight: 700,
                                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px'
                            }}
                        >
                            {isSubmitting || isUploading ? (
                                <>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                        borderTop: '2px solid white',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }} />
                                    {isUploading ? 'Uploading Image...' : 'Creating Listing...'}
                                </>
                            ) : (
                                <>
                                    <span>✨</span>
                                    Create Amazing Listing
                                </>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
            `}</style>
        </motion.div>
    );
}