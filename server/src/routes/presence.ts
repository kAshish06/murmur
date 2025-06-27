import { Router, Response, NextFunction } from "express";
import { param, validationResult } from "express-validator";
import { getUserPresence, getUsersPresence } from "../services/presenceService";
import { AuthenticatedRequest, verifyToken } from "../middleware/verifyToken";
import HTTP_STATUS_CODE_MAP from "../utils/httpStatusCodeMap";
import { query } from "winston";

const router = Router();

router.get(
  "/:userId",
  verifyToken,
  [param("userId").isInt().withMessage("Invalid conversation ID")],
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(HTTP_STATUS_CODE_MAP.BAD_REQUEST)
          .json({ errors: errors.array() });
        return;
      }
      const { userId } = req.params;
      const userPresence = await getUserPresence(Number(userId));
      res.status(HTTP_STATUS_CODE_MAP.SUCCESS).json(userPresence);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/group",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userIds = req.query.userIds;
      if (!userIds || typeof userIds !== "string") {
        res
          .status(HTTP_STATUS_CODE_MAP.BAD_REQUEST)
          .json({ error: "Incorrect user ids query param" });
        return;
      }
      const convertedUserIds = userIds
        .split(",")
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id));
      const usersPresence = await getUsersPresence(convertedUserIds);
      if (!usersPresence) {
        res
          .status(HTTP_STATUS_CODE_MAP.INTERNAL_ERROR)
          .json({ error: "Error encountered in fetching users presence data" });
        return;
      }
      res.status(HTTP_STATUS_CODE_MAP.SUCCESS).json(usersPresence);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
