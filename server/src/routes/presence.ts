import { Router, Response, NextFunction } from "express";
import { param, validationResult } from "express-validator";
import { getUserPresence, getUsersPresence } from "../services/presenceService";
import { AuthenticatedRequest, verifyToken } from "../middleware/verifyToken";
import HTTP_STATUS_CODE_MAP from "../utils/httpStatusCodeMap";

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
      if (!userPresence) {
        res
          .status(HTTP_STATUS_CODE_MAP.INTERNAL_ERROR)
          .json({ error: "Could not fetch presence data for user." });
        return;
      }
      res.status(HTTP_STATUS_CODE_MAP.SUCCESS).json(userPresence);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
