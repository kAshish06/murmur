import HTTP_STATUS_CODE_MAP from "../utils/httpStatusCodeMap";

export const ERROR_TYPE_INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";
export const ERROR_TYPE_USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS";
export const ERROR_TYPE_USER_NOT_FOUND = "USER_NOT_FOUND";
export const ERROR_TYPE_PASSWORD_INVALID = "PASSWORD_INVALID";
export const ERROR_TYPE_REFRESH_TOKEN_REQUIRED = "REFRESH_TOKEN_REQUIRED";
export const ERROR_TYPE_REFRESH_TOKEN_INVALID = "REFRESH_TOKEN_INVALID";
export const ERROR_TYPE_USERID_INVALID = "USERID_INVALID";
export const ERROR_TYPE_MISSING_EMAIL_PHONE = "MISSING_EMAIL_PHONE";
export const ERROR_TYPE_CREATE_REFRESH_TOKEN_FAILED =
  "CREATE_REFRESH_TOKEN_FAILED";
export const ERROR_TYPE_INVALID_REFRESH_TOKEN = "INVALID_REFRESH_TOKEN";

export type ServiceError = {
  error: AppError;
};
export type AppError = {
  code: number;
  message: string;
  type: string;
  details?: string | Record<string, unknown>;
};

export const INTERNAL_SERVER_ERROR: AppError = {
  code: HTTP_STATUS_CODE_MAP.INTERNAL_ERROR,
  message: "Internal server error",
  type: ERROR_TYPE_INTERNAL_SERVER_ERROR,
};

export const USER_ALREADY_EXISTS: AppError = {
  code: HTTP_STATUS_CODE_MAP.BAD_REQUEST,
  message: "User already exists",
  type: ERROR_TYPE_USER_ALREADY_EXISTS,
};

export const USER_NOT_FOUND: AppError = {
  code: HTTP_STATUS_CODE_MAP.NOT_FOUND,
  message: "User not found",
  type: ERROR_TYPE_USER_NOT_FOUND,
};

export const PASSWORD_INVALID: AppError = {
  code: HTTP_STATUS_CODE_MAP.BAD_REQUEST,
  message: "User not found",
  type: ERROR_TYPE_PASSWORD_INVALID,
};

export const REFRESH_TOKEN_REQUIRED: AppError = {
  code: HTTP_STATUS_CODE_MAP.BAD_REQUEST,
  message: "Refresh token is required",
  type: ERROR_TYPE_REFRESH_TOKEN_REQUIRED,
};

export const REFRESH_TOKEN_INVALID: AppError = {
  code: HTTP_STATUS_CODE_MAP.BAD_REQUEST,
  message: "Refresh token is invalid",
  type: ERROR_TYPE_REFRESH_TOKEN_INVALID,
};

export const USERID_INVALID: AppError = {
  code: HTTP_STATUS_CODE_MAP.BAD_REQUEST,
  message: "User id is invalid",
  type: ERROR_TYPE_USERID_INVALID,
};

export const MISSING_EMAIL_PHONE: AppError = {
  code: HTTP_STATUS_CODE_MAP.BAD_REQUEST,
  message: "Either email or phone number and password is required",
  type: ERROR_TYPE_MISSING_EMAIL_PHONE,
};

export const CREATE_REFRESH_TOKEN_ERROR: AppError = {
  code: HTTP_STATUS_CODE_MAP.INTERNAL_ERROR,
  message: "Internal server error while creating token",
  type: ERROR_TYPE_CREATE_REFRESH_TOKEN_FAILED,
};

export const INVALID_REFRESH_TOKEN: AppError = {
  code: HTTP_STATUS_CODE_MAP.BAD_REQUEST,
  message: "Refresh token is invalid",
  type: ERROR_TYPE_INVALID_REFRESH_TOKEN,
};
