import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { ServiceError } from "../errors/errors";
import prisma from "../utils/prismaClient";
import type { RefreshToken, User } from "@prisma/client";
import {
  CREATE_REFRESH_TOKEN_ERROR,
  INVALID_REFRESH_TOKEN,
} from "../errors/errors";
import hashToken, { getRefreshTokenExpiry } from "../utils/hashToken";

const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const ACCESS_TOKEN_EXPIRY = "15m";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

type ClientRefreshToken = {
  refreshToken: string;
};
export const createRefreshToken = async (
  userId: number,
  userAgent: string | undefined,
  ipAddress: string | undefined
): Promise<ClientRefreshToken | ServiceError> => {
  const refreshToken = uuidv4();
  const refreshTokenHash = hashToken(refreshToken);

  const expiresAt = getRefreshTokenExpiry(REFRESH_TOKEN_EXPIRY_DAYS);
  try {
    const refreshTokenFromDb = await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });
    return { refreshToken };
  } catch (e) {
    return { error: CREATE_REFRESH_TOKEN_ERROR };
  }
};

export type RefreshTokenWithUser = RefreshToken & { user: User };

export const findRefreshToken = async (
  refreshToken: string
): Promise<RefreshTokenWithUser | ServiceError> => {
  try {
    const tokenHash = hashToken(refreshToken);
    const refreshTokenFromDb = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!refreshTokenFromDb) {
      return { error: INVALID_REFRESH_TOKEN };
    }

    if (new Date() > refreshTokenFromDb.expiresAt) {
      await prisma.refreshToken.delete({
        where: { id: refreshTokenFromDb.id },
      });
      return { error: INVALID_REFRESH_TOKEN };
    }

    return refreshTokenFromDb;
  } catch (e) {
    return { error: INVALID_REFRESH_TOKEN };
  }
};

export const deleteAndAddNewRefreshToken = async (
  refreshToken: string,
  userId: number,
  userAgent: string | undefined,
  ipAddress: string | undefined
): Promise<ClientRefreshToken | ServiceError> => {
  try {
    const oldTokenHash = hashToken(refreshToken);
    const newRefreshToken = crypto.randomUUID();
    const tokenHash = hashToken(newRefreshToken);
    const expiresAt = getRefreshTokenExpiry(REFRESH_TOKEN_EXPIRY_DAYS);
    const result = await prisma.$transaction([
      prisma.refreshToken.delete({ where: { tokenHash: oldTokenHash } }),
      prisma.refreshToken.create({
        data: {
          userId: userId,
          tokenHash,
          expiresAt,
          userAgent,
          ipAddress,
        },
      }),
    ]);
    return { refreshToken: newRefreshToken };
  } catch (e) {
    return { error: CREATE_REFRESH_TOKEN_ERROR };
  }
};

export const getNewAccessToken = (user: User) => {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

export const invalidateRefreshToken = async (
  refreshToken: string
): Promise<void> => {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.delete({
    where: {
      tokenHash: tokenHash,
    },
  });
};
