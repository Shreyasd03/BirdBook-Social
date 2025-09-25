import { NextApiRequest, NextApiResponse } from 'next';
import { verifyTokenFromHeader } from '../auth/auth';
import { prisma } from '../auth/prisma';

/**
 * POST /api/posts/create
 * Creates a new post for the authenticated user
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the JWT token from Authorization header
    const decoded = verifyTokenFromHeader(req.headers.authorization);

    const { title, content } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Validate field lengths
    if (title.length > 100) {
      return res.status(400).json({ error: 'Title must be 100 characters or less' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Content must be 1000 characters or less' });
    }

    // Create the post
    const newPost = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        authorId: decoded.id
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            bio: true
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                username: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    // Format the response to match the FeedPost interface
    const formattedPost = {
      id: newPost.id,
      title: newPost.title,
      content: newPost.content,
      createdAt: newPost.createdAt.toISOString(),
      author: {
        id: newPost.author.id,
        username: newPost.author.username,
        bio: newPost.author.bio
      },
      comments: newPost.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        author: {
          id: comment.author.id,
          username: comment.author.username
        }
      }))
    };

    res.status(201).json({
      message: 'Post created successfully',
      post: formattedPost
    });

  } catch (error) {
    console.error('Error creating post:', error);
    
    // Handle token verification errors
    if (error instanceof Error && (error.message === 'No token provided' || error.message === 'Invalid token')) {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}
