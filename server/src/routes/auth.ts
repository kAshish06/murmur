import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import {
  registerUser,
  findUserByEmail,
  findUserByPhone,
  findUserById,
  getSafeUser,
} from "../services/userService";
import {
  createRefreshToken,
  findRefreshToken,
  deleteAndAddNewRefreshToken,
  getNewAccessToken,
  invalidateRefreshToken,
} from "../services/tokenService";
import { AuthenticatedRequest, verifyToken } from "../middleware/verifyToken";
import {
  PASSWORD_INVALID,
  REFRESH_TOKEN_REQUIRED,
  USERID_INVALID,
  MISSING_EMAIL_PHONE,
} from "../errors/errors";
import HTTP_STATUS_CODE_MAP from "../utils/httpStatusCodeMap";
import { body, validationResult, query } from "express-validator";

const router = express.Router();

router.post(
  "/register",
  [
    body("username").isString().notEmpty().withMessage("Username is required"),
    body("email").optional().isEmail(),
    body("phone").optional().isMobilePhone("any"),
    body("countryCode").optional().isString(),
    body("password").isLength({ min: 6 }),
    body().custom((body) => {
      if (!body.email && !body.phone) {
        throw new Error("Either email or phone is required");
      }
      return true;
    }),
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.array() });
        return;
      }

      const { username, phone, countryCode, email, password } = req.body;

      if (!(phone || email) || !password) {
        res
          .status(MISSING_EMAIL_PHONE.code)
          .json({ error: MISSING_EMAIL_PHONE });
        return;
      }
      const user = await registerUser(
        username,
        phone,
        countryCode,
        email,
        password
      );

      if ("error" in user) {
        res.status(user.error.code).json({ error: user.error });
        return;
      }

      const token = getNewAccessToken(user);

      const refreshToken = await createRefreshToken(
        user.id,
        req.headers["user-agent"],
        req.ip
      );

      if ("error" in refreshToken) {
        res.status(200).json({
          error: refreshToken.error,
          message:
            "Registration was successful. Please login to start your conversations.",
        });
        return;
      }
      res.status(HTTP_STATUS_CODE_MAP.SUCCESS).json({
        user: getSafeUser(user),
        token,
        refreshToken: refreshToken.refreshToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/login",
  [
    body("email").optional().isEmail(),
    body("phone").optional().isMobilePhone("any"),
    body("countryCode").optional().isString(),
    body("password").isLength({ min: 6 }),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.array() });
        return;
      }

      const { email, phone, countryCode, password } = req.body;
      const user = email
        ? await findUserByEmail(email)
        : await findUserByPhone(phone, countryCode);

      if ("error" in user) {
        res.status(user.error.code).json({ error: user.error });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({ error: PASSWORD_INVALID });
        return;
      }
      const token = getNewAccessToken(user);

      const refreshToken = await createRefreshToken(
        user.id,
        req.headers["user-agent"],
        req.ip
      );
      if ("error" in refreshToken) {
        res.status(refreshToken.error.code).json({ error: refreshToken.error });
        return;
      }
      res.status(HTTP_STATUS_CODE_MAP.SUCCESS).json({
        user: getSafeUser(user),
        token,
        refreshToken: refreshToken.refreshToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res
          .status(REFRESH_TOKEN_REQUIRED.code)
          .json({ error: REFRESH_TOKEN_REQUIRED });
        return;
      }

      const existingToken = await findRefreshToken(refreshToken);
      if ("error" in existingToken) {
        res
          .status(existingToken.error.code)
          .json({ error: existingToken.error });
        return;
      }
      const currentUserAgent = req.headers["user-agent"];
      if (existingToken.userAgent !== currentUserAgent) {
        res.status(403).json({ error: "Token used from different device" });
        return;
      }

      const newAccessToken = getNewAccessToken(existingToken.user);
      const result = await deleteAndAddNewRefreshToken(
        refreshToken,
        existingToken.user.id,
        req.headers["user-agent"],
        req.ip
      );
      if ("error" in result) {
        res.status(result.error.code).json({ error: result.error });
        return;
      }
      res.status(HTTP_STATUS_CODE_MAP.SUCCESS).json({
        accessToken: newAccessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/user",
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
      res.status(HTTP_STATUS_CODE_MAP.SUCCESS).json({ user });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/logout",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token is required for logout" });
      return;
    }

    try {
      await invalidateRefreshToken(refreshToken);

      res.status(200).json({ message: "Logout successful" });
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;
