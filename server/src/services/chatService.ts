import prisma from "../utils/prismaClient";
import { Message as PrismaMessage } from "@prisma/client";
import { logger } from "../utils/logger";

export interface CreateMessagePayload {
  conversationId: number;
  senderId: number;
  content: string;
}

/**
 * Saves a new message to the database.
 * Allows database errors to propagate to the caller.
 * @param data The data for the message to create.
 * @returns The created message object from the database.
 * @throws Error if the database operation fails.
 */
export const createMessage = async (
  data: CreateMessagePayload
): Promise<PrismaMessage> => {
  try {
    const newMessage = await prisma.message.create({
      data: {
        conversation: {
          connect: { id: data.conversationId },
        },
        sender: {
          connect: { id: data.senderId },
        },
        content: data.content,
      },
    });
    return newMessage;
  } catch (error) {
    logger.error("Error creating message:", error);
    throw error;
  }
};

export const findUserConversations = async (userId: number) => {
  return await prisma.userConversation.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      conversation: {
        updatedAt: "desc",
      },
    },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
            where: {
              userId: {
                not: userId,
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              content: true,
              createdAt: true,
              senderId: true,
            },
          },
        },
      },
    },
  });
};

export const createConversation = async (
  type: string,
  uniqueParticipantIds: number[]
) => {
  return await prisma.$transaction(async (prisma) => {
    const conversation = await prisma.conversation.create({
      data: {
        type: type,
      },
    });

    const userConversationData = uniqueParticipantIds.map((userId) => ({
      userId: userId,
      conversationId: conversation.id,
    }));

    await prisma.userConversation.createMany({
      data: userConversationData,
      skipDuplicates: true,
    });

    const createdConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        },
      },
    });

    return createdConversation;
  });
};

/**
 * Fetches messages for a specific conversation if the user is a participant.
 * @param conversationId The ID of the conversation.
 * @param userId The ID of the user requesting the messages.
 * @returns A list of messages or null if the conversation is not found or user is not a participant.
 */
export const getMessagesForConversation = async (
  conversationId: number,
  userId: number
) => {
  try {
    // First, verify if the user is a participant in the conversation
    const userConversation = await prisma.userConversation.findUnique({
      where: {
        userId_conversationId: {
          // Use the compound unique constraint
          userId: userId,
          conversationId: conversationId,
        },
      },
    });

    // If user is not a participant, return null
    if (!userConversation) {
      return null;
    }

    // If user is a participant, fetch the messages for the conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      orderBy: {
        createdAt: "asc", // Order by creation time
      },
      include: {
        sender: {
          // Include sender information
          select: {
            // Select only necessary user fields for the sender
            id: true,
            username: true,
          },
        },
      },
    });

    return messages;
  } catch (error) {
    console.error("Error fetching messages for conversation:", error);
    throw error;
  }
};

export async function getConversationParticipants(conversationId: number) {
  try {
    const userConversations = await prisma.userConversation.findMany({
      where: { conversationId },
      select: {
        userId: true,
      },
    });

    if (!userConversations.length) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    return userConversations.map((uc) => uc.userId);
  } catch (error) {
    logger.error(`Error getting conversation participants:`, error);
    throw error;
  }
}
