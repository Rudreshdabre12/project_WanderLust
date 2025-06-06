// pages/api/cloudinary/signature.ts
// OR app/api/cloudinary/signature/route.ts (if using App Router)

import { v2 as cloudinary } from 'cloudinary';
import { NextApiRequest, NextApiResponse } from 'next';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Type definitions
interface SignatureParams {
  timestamp: number;
  folder: string;
}

interface SignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
}

interface ErrorResponse {
  error: string;
}

// For Pages Router (pages/api/cloudinary/signature.ts)
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignatureResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Parameters for the signature
    const params: SignatureParams = {
      timestamp: timestamp,
      folder: 'listings' // Optional: organize uploads in folders
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    );

    res.status(200).json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      apiKey: process.env.CLOUDINARY_API_KEY!,
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    res.status(500).json({ error: 'Failed to generate signature' });
  }
}

// For App Router (app/api/cloudinary/signature/route.ts)
export async function GET(): Promise<Response> {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Parameters for the signature
    const params: SignatureParams = {
      timestamp: timestamp,
      folder: 'listings' // Optional: organize uploads in folders
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    );

    const response: SignatureResponse = {
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      apiKey: process.env.CLOUDINARY_API_KEY!,
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error generating signature:', error);
    return Response.json(
      { error: 'Failed to generate signature' } as ErrorResponse,
      { status: 500 }
    );
  }
}