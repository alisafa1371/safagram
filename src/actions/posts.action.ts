"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, imageUrl: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;
    const post = await prisma.post.create({
      data: {
        content,
        image: imageUrl,
        authorId: userId,
      },
    });

    revalidatePath("/"); //purge the cache for the home page
    return { post, success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
            userName: true,
            id: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                userName: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
    return posts;
  } catch (error) {
    console.log("Error fetching posts", error);
    throw new Error("Error fetching posts");
  }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;

    //check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (!post) throw new Error("Post not found");

    if (existingLike) {
      //unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      //like and create notification (only if user is not the author)
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            postId,
          },
        }),
        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId,
                  creatorId: userId,
                  postId,
                },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.log("Error toggling like", error);
    return { success: false, error: "Error toggling like" };
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;
    if (!content) return { success: false, error: "Content is required" };

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (!post) throw new Error("Post not found");

    //create comment and notification (only if user is not the author)
    const [comment] = await prisma.$transaction(async (tx) => {
      //create first comment
      const newComment = await tx.comment.create({
        data: {
          content,
          postId,
          authorId: userId,
        },
      });

      //create comment and notification (only if user is not the author
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath("/");
    return { success: true, comment };
  } catch (error) {
    console.log("Error creating comment", error);
    return { success: false, error: "Error creating comment" };
  }
}

export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });
    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId)
      throw new Error("You are not the author of this post");

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    revalidatePath("/"); //purge the cache for the home page
    return { success: true };
  } catch (error) {
    console.log("Error deleting post", error);
    return { success: false, error: "Error deleting post" };
  }
}
