import prisma from "../utils/prismaClient";
import {
  Message as PrismaMessage,
  Conversation as PrismaConversation,
} from "@prisma/client";
import { logger } from "../utils/logger";
import { MessageStatusEnum } from "../types/messages";

export interface CreateMessagePayload {
  conversationId: number;
  senderId: number;
  content: string;
  status?: MessageStatusEnum;
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
): Promise<{ message: PrismaMessage; conversation: PrismaConversation }> => {
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
        status: data.status,
      },
    });
    const conversation = await prisma.conversation.update({
      where: {
        id: data.conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });
    return { message: newMessage, conversation };
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

async function findExistingConversation(
  type: string,
  participantIds: number[]
) {
  const conversations = await prisma.conversation.findMany({
    where: {
      type,
      participants: {
        every: {
          userId: { in: participantIds },
        },
      },
    },
    include: {
      _count: {
        select: { participants: true },
      },
      participants: {
        include: {
          user: {
            select: { id: true, username: true },
          },
        },
      },
    },
  });

  return conversations.find(
    (conv) => conv._count.participants === participantIds.length
  );
}

interface ConversationWithParticipants {
  id: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  participants: Array<{
    userId: number;
    user: {
      id: number;
      username: string | null;
    };
  }>;
  messages: Array<{
    content: string;
    createdAt: Date;
    senderId: number;
  }>;
}

export interface ConversationResponse {
  id: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  otherParticipants: Array<{ id: number; username: string }>;
  lastMessage: string | null;
  clientId?: number;
}

export const createConversation = async (
  type: string,
  uniqueParticipantIds: number[]
): Promise<ConversationResponse> => {
  // First try to find existing conversation without transaction
  const existing = await findExistingConversation(type, uniqueParticipantIds);
  if (existing) {
    return {
      id: existing.id,
      type: existing.type || "private",
      createdAt: existing.createdAt.toISOString(),
      updatedAt: existing.updatedAt.toISOString(),
      otherParticipants: existing.participants
        .filter((p) => p.userId !== uniqueParticipantIds[0])
        .map((p) => ({
          id: p.user.id,
          username: p.user.username || "",
        })),
      lastMessage: null,
    };
  }

  // Create new conversation if not exists
  const result = await prisma.$transaction(async (tx) => {
    const conversation = await tx.conversation.create({
      data: { type },
    });

    await tx.userConversation.createMany({
      data: uniqueParticipantIds.map((userId) => ({
        userId,
        conversationId: conversation.id,
      })),
      skipDuplicates: true,
    });

    const withDetails = await tx.conversation.findUnique({
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

    if (!withDetails) {
      throw new Error("Failed to create conversation");
    }

    return withDetails;
  });

  return {
    id: result.id,
    type: result.type || "private",
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString(),
    otherParticipants: result.participants
      .filter((p) => p.userId !== uniqueParticipantIds[0])
      .map((p) => ({
        id: p.user.id,
        username: p.user.username || "",
      })),
    lastMessage: null,
  };
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
