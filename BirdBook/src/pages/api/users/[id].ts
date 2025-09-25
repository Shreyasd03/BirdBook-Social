import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UserWithPosts {
  id: number;
  username: string;
  email: string;
  bio: string | null;
  createdAt: string;
  posts: {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    comments: {
      id: number;
      content: string;
      createdAt: string;
      author: {
        id: number;
        username: string;
      };
    }[];
  }[];
}

/**
 * GET /api/users/[id]
 * Fetches a user's profile information and their posts
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const userId = parseInt(id as string);

    // Fetch user with their posts, ordered by most recent first
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        createdAt: true,
        posts: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            comments: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                author: {
                  select: {
                    id: true,
                    username: true,
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format the response
    const userWithPosts: UserWithPosts = {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
      posts: user.posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        comments: post.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          author: {
            id: comment.author.id,
            username: comment.author.username
          }
        }))
      }))
    };

    res.status(200).json(userWithPosts);

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
