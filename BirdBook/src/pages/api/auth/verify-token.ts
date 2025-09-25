import { NextApiRequest, NextApiResponse } from 'next';
import { verifyTokenFromHeader } from './auth';

/**
 * Token Verification API Endpoint
 * 
 * Verifies JWT tokens server-side for security
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify the token from Authorization header
    const decoded = verifyTokenFromHeader(req.headers.authorization);
    
    // Return user info if token is valid
    return res.status(200).json({
      user: {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email
      }
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      message: 'Invalid or expired token' 
    });
  }
}
