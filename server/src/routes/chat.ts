import express, { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, verifyToken } from "../middleware/verifyToken";
import { USERID_INVALID } from "../errors/errors";
import {
  findUserConversations,
  createConversation,
  getMessagesForConversation,
} from "../services/chatService";
import HTTP_STATUS_CODE_MAP from "../utils/httpStatusCodeMap";
import prisma from "../utils/prismaClient";
import { body, validationResult, param } from "express-validator";

const router = express.Router();

router.get(
  "/conversations",
  verifyToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userIdRaw = req.user?.id;
      const userId = Number(userIdRaw);

      if (!userIdRaw || Number.isNaN(userId)) {
        res.status(USERID_INVALID.code).json({ error: USERID_INVALID });
        return;
      }

      const userConversations = await findUserConversations(userId);

      const conversations = userConversations.map((uc) => {
        const conversation = uc.conversation;

        return {
          id: conversation.id,
          type: conversation.type,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          otherParticipants: conversation.participants.map((p) => p.user),
          lastMessage:
            conversation.messages.length > 0 ? conversation.messages[0] : null,
        };
      });

      res.status(HTTP_STATUS_CODE_MAP.SUCCESS).json(conversations);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/conversations/:conversationId/messages",
  verifyToken,
  [param("conversationId").isInt().withMessage("Invalid conversation ID")],
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { conversationId: conversationIdRaw } = req.params;
      const conversationId = parseInt(conversationIdRaw, 10);

      const userId = req.user?.id;

      if (userId === undefined) {
        res.status(USERID_INVALID.code).json({ error: USERID_INVALID });
        return;
      }

      const messages = await getMessagesForConversation(
        conversationId,
        Number(userId)
      );

      if (!messages) {
        res.status(404).json({
          message: "Conversation not found or user not a participant",
        });
        return;
      }

      res.status(HTTP_STATUS_CODE_MAP.SUCCESS).json({ messages });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/conversations",
  verifyToken,
  [
    body("participantIds")
      .isArray({ min: 1 })
      .withMessage(
        "participantIds must be an array with at least one participant"
      ),
    body("participantIds.*")
      .isInt()
      .withMessage("Each participantId must be an integer"),
    body("type")
      .optional()
      .isString()
      .withMessage("type must be a string")
      .isIn(["private", "group"])
      .withMessage('type must be either "private" or "group"'),
  ],
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.array() });
        return;
      }
      const userIdRaw = req.user?.id;
      const userId = Number(userIdRaw);

      if (!userIdRaw || Number.isNaN(userId)) {
        res.status(USERID_INVALID.code).json({ error: USERID_INVALID });
        return;
      }

      let { participantIds, type }: { participantIds: number[]; type: string } =
        req.body;

      if (!participantIds.includes(userId)) {
        participantIds.push(userId);
      }

      const uniqueParticipantIds = [...new Set(participantIds)];

      if (uniqueParticipantIds.length < 2) {
        res.status(400).json({
          message: "A conversation requires at least two participants.",
        });
        return;
      }

      if (!type) {
        type = uniqueParticipantIds.length === 2 ? "private" : "group";
      }

      const newConversation = await createConversation(
        type,
        uniqueParticipantIds
      );

      res.status(HTTP_STATUS_CODE_MAP.SUCCESS).json(newConversation);
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;
