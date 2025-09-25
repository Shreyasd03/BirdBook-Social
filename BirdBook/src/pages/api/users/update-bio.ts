import { NextApiRequest, NextApiResponse } from 'next';
import { verifyTokenFromHeader } from '../auth/auth';
import { prisma } from '../auth/prisma';

/**
 * PUT /api/users/update-bio
 * Updates the bio for the authenticated user
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the JWT token from Authorization header
    const decoded = verifyTokenFromHeader(req.headers.authorization);

    const { bio } = req.body;

    // Validate bio length (optional, but good practice)
    if (bio && bio.length > 500) {
      return res.status(400).json({ error: 'Bio must be 500 characters or less' });
    }

    // Update the user's bio
    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: { bio: bio || null },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        createdAt: true
      }
    });

    res.status(200).json({
      message: 'Bio updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        createdAt: updatedUser.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating bio:', error);
    
    // Handle token verification errors
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}
