import { NextApiRequest, NextApiResponse } from 'next';
import { verifyTokenFromHeader } from '../auth/auth';
import { prisma } from '../auth/prisma';

/**
 * POST /api/comments/create
 * Creates a new comment for the authenticated user
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the JWT token from Authorization header
    const decoded = verifyTokenFromHeader(req.headers.authorization);

    const { postId, content } = req.body;

    // Validate required fields
    if (!postId || !content) {
      return res.status(400).json({ error: 'Post ID and content are required' });
    }

    // Validate content length
    if (content.length > 500) {
      return res.status(400).json({ error: 'Comment must be 500 characters or less' });
    }

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create the comment
    const newComment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: parseInt(postId),
        authorId: decoded.id
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    // Format the response to match the comment interface
    const formattedComment = {
      id: newComment.id,
      content: newComment.content,
      createdAt: newComment.createdAt.toISOString(),
      author: {
        id: newComment.author.id,
        username: newComment.author.username
      }
    };

    res.status(201).json({
      message: 'Comment created successfully',
      comment: formattedComment
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    
    // Handle token verification errors
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}
