import type { User } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../utils/prismaClient";
import {
  ServiceError,
  INTERNAL_SERVER_ERROR,
  USER_ALREADY_EXISTS,
  USER_NOT_FOUND,
} from "../errors/errors";

export const registerUser = async (
  username: string,
  phone: string,
  countryCode: string,
  email: string,
  password: string
): Promise<User | ServiceError> => {
  let existing;
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          {
            AND: [
              { phone: phone || undefined },
              { countryCode: countryCode || undefined },
            ],
          },
        ],
      },
    });
    if (existingUser) {
      return { error: USER_ALREADY_EXISTS };
    }
  } catch (e) {
    return { error: INTERNAL_SERVER_ERROR };
  }
  const passwordHash = await bcrypt.hash(password, 10);

  const newUser: User = await prisma.user.create({
    data: {
      username,
      email,
      phone,
      countryCode,
      password: passwordHash,
    },
  });
  return newUser;
};

export const findUserByEmail = async (
  email: string
): Promise<User | ServiceError> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return { error: USER_NOT_FOUND };
    }
    return user;
  } catch (e) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export const findUserByPhone = async (
  phone: string,
  countryCode: string
): Promise<User | ServiceError> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        phone,
        countryCode,
      },
    });
    if (!user) {
      return { error: USER_NOT_FOUND };
    }
    return user;
  } catch (e) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export type PublicUser = Pick<
  User,
  "id" | "email" | "phone" | "countryCode" | "username" | "createdAt"
>;

export const findUserById = async (
  userId: number
): Promise<PublicUser | ServiceError> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        countryCode: true,
        username: true,
        createdAt: true,
      },
    });
    if (!user) {
      return { error: USER_NOT_FOUND };
    }
    return user;
  } catch (e) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export const getSafeUser = (user: User): PublicUser => {
  const { password, ...safeUser } = user;
  return safeUser;
};
