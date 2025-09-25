import { NextApiRequest, NextApiResponse } from 'next';
import { registerUser } from './auth';

/**
 * Registration API Endpoint
 * 
 * Handles user registration with proper validation, password hashing, and database storage
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Username, email, and password are required' 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Username validation
    if (username.length < 3) {
      return res.status(400).json({ 
        message: 'Username must be at least 3 characters long' 
      });
    }

    // Register the user
    const user = await registerUser(username, email, password);
    
    console.log('Registration successful:', { 
      id: user.id, 
      username: user.username, 
      email: user.email 
    });
    
    // Return success response (don't include password hash)
    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ 
          message: error.message 
        });
      }
    }
    
    return res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
}
