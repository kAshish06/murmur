console.log("Executing seed script...");

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start Seeding ...");

  /** Create users */
  const user1 = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      phone: "9988776655",
      countryCode: "+1",
      username: "Alice",
      password: "111222",
    },
  });
  const user2 = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      phone: "9887766554",
      countryCode: "+1",
      username: "Bob",
      password: "111222",
    },
  });

  console.log("Users created");
  /** Users created */

  /** Create conversation */
  console.log("Create conversations");
  const conv1 = await prisma.conversation.upsert({
    where: { id: 1 },
    update: {},
    create: {
      type: "private",
    },
  });
  const conv2 = await prisma.conversation.upsert({
    where: { id: 2 },
    update: {},
    create: {
      type: "private",
    },
  });
  console.log("Conversation created");

  /** Create userConversations */
  console.log("Create user conversation");
  await prisma.userConversation.upsert({
    where: {
      userId_conversationId: {
        userId: user1.id,
        conversationId: conv1.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      conversationId: conv1.id,
    },
  });
  await prisma.userConversation.upsert({
    where: {
      userId_conversationId: {
        userId: user1.id,
        conversationId: conv2.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      conversationId: conv2.id,
    },
  });
  await prisma.userConversation.upsert({
    where: {
      userId_conversationId: {
        userId: user2.id,
        conversationId: conv1.id,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      conversationId: conv1.id,
    },
  });
  await prisma.userConversation.upsert({
    where: {
      userId_conversationId: {
        userId: user2.id,
        conversationId: conv2.id,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      conversationId: conv2.id,
    },
  });
  console.log("User conversation created");

  /** Create messages */
  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: user1.id,
      content: "Hi",
    },
  });
  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: user2.id,
      content: "Hey",
    },
  });
  /** Messages created */
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
