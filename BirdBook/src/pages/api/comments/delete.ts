import { NextApiRequest, NextApiResponse } from 'next';
import { verifyTokenFromHeader } from '../auth/auth';
import { prisma } from '../auth/prisma';

/**
 * DELETE /api/comments/delete
 * Deletes a comment (only if the authenticated user is the author)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the JWT token from Authorization header
    const decoded = verifyTokenFromHeader(req.headers.authorization);

    const { commentId } = req.body;

    // Validate required fields
    if (!commentId) {
      return res.status(400).json({ error: 'Comment ID is required' });
    }

    // Check if the comment exists and get the author
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      select: { id: true, authorId: true }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if the authenticated user is the author
    if (comment.authorId !== decoded.id) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: parseInt(commentId) }
    });

    res.status(200).json({
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    
    // Handle token verification errors
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}
