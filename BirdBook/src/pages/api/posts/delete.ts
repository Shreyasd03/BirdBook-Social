import { NextApiRequest, NextApiResponse } from 'next';
import { verifyTokenFromHeader } from '../auth/auth';
import { prisma } from '../auth/prisma';

/**
 * DELETE /api/posts/delete
 * Deletes a post (only if the authenticated user is the author)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the JWT token from Authorization header
    const decoded = verifyTokenFromHeader(req.headers.authorization);

    const { postId } = req.body;

    // Validate required fields
    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    // Check if the post exists and get the author
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      select: { id: true, authorId: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the authenticated user is the author
    if (post.authorId !== decoded.id) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    // Delete the post (this will also delete associated comments due to cascade)
    await prisma.post.delete({
      where: { id: parseInt(postId) }
    });

    res.status(200).json({
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    
    // Handle token verification errors
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}
