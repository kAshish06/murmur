import express, { Request, Response, NextFunction } from "express";
import { query } from "express-validator";
import { validationResult } from "express-validator";
import { findUserById, searchUsers } from "../services/userService";
import { verifyToken, AuthenticatedRequest } from "../middleware/verifyToken";
import { USERID_INVALID } from "../errors/errors";
import HTTP_STATUS_CODE_MAP from "../utils/httpStatusCodeMap";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userIdRaw = req.user?.id;
      const userId = Number(userIdRaw);

      if (Number.isNaN(userId)) {
        res.status(USERID_INVALID.code).json({ error: USERID_INVALID });
        return;
      }

      const user = await findUserById(userId);
      if ("error" in user) {
        res.status(user.error.code).json({ error: user.error });
        return;
      }

      res.status(HTTP_STATUS_CODE_MAP.SUCCESS).json(user);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/search",
  [
    verifyToken,
    query("q")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Search query must be at least 2 characters"),
  ],
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(HTTP_STATUS_CODE_MAP.BAD_REQUEST)
          .json({ errors: errors.array() });
        return;
      }

      const { q } = req.query;
      const result = await searchUsers(q as string);

      if ("error" in result) {
        res.status(result.error.code).json({ error: result.error });
        return;
      }

      res.status(HTTP_STATUS_CODE_MAP.SUCCESS).json({ users: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
