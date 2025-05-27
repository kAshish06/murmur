import prisma from "../utils/prismaClient";

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
      // Or you could return a specific error object here
      // return { error: new ServiceError(404, "Conversation not found or not accessible") };
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
            // Include other safe user fields as needed, e.g., profile picture URL
          },
        },
      },
    });

    return messages;
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching messages for conversation:", error);
    // Propagate the error or return a standardized error object
    // return { error: new ServiceError(500, "Failed to fetch messages") };
    throw error; // Rethrow the error to be caught by the route handler's try/catch
  }
};
