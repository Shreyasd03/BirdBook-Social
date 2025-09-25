import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../auth/prisma';
import { verifyJWT } from '../auth/auth';

// ===== TYPESCRIPT INTERFACES =====
interface FeedPost {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    bio: string | null;
  };
  comments: {
    id: number;
    content: string;
    createdAt: string;
    author: {
      id: number;
      username: string;
    };
  }[];
}

interface FeedResponse {
  posts: FeedPost[];
}

/**
 * GET /api/main/feed
 * 
 * Fetches all posts for the main feed.
 * Returns all posts with author information and comments.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FeedResponse | { error: string }>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ===== AUTHENTICATION CHECK =====
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    verifyJWT(token); // Verify token is valid
  } catch (error) {
    console.error('Auth verification failed:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    // ===== DATABASE QUERY =====
    // Fetch all posts with author and comments
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            bio: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc', // Newest comments first
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Newest posts first
      },
    });

    // ===== FORMAT RESPONSE =====
    const formattedPosts: FeedPost[] = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      author: {
        id: post.author.id,
        username: post.author.username,
        bio: post.author.bio,
      },
      comments: post.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        author: {
          id: comment.author.id,
          username: comment.author.username,
        },
      })),
    }));

    // ===== RETURN SUCCESS RESPONSE =====
    return res.status(200).json({
      posts: formattedPosts,
    });

  } catch (error) {
    console.error('Feed API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error while fetching feed' 
    });
  }
}