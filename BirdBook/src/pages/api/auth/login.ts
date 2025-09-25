import { NextApiRequest, NextApiResponse } from 'next';
import { loginUser, generateJWT } from './auth';

/**
 * Login API Endpoint
 * 
 * Handles user authentication with bcrypt password verification and JWT token generation
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // Authenticate user
    const user = await loginUser(email, password);
    
    // Generate JWT token
    const token = generateJWT({
      id: user.id,
      username: user.username,
      email: user.email
    });

    console.log('Login successful:', { 
      id: user.id, 
      username: user.username, 
      email: user.email 
    });

    // Return success response with token
    return res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('Invalid email or password')) {
        return res.status(401).json({ 
          message: 'Invalid email or password' 
        });
      }
    }
    
    return res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
}
