export type LoginPayload =
  | {
      email?: string | undefined;
      phone: string | undefined;
      countryCode: string | undefined;
      password: string;
    }
  | {
      email: string | undefined;
      phone?: string | undefined;
      countryCode?: string | undefined;
      password: string;
    };
export type RegisterUserPayload =
  | {
      username: string;
      email?: string | undefined;
      phone: string | undefined;
      countryCode: string | undefined;
      password: string;
    }
  | {
      username: string;
      email: string | undefined;
      phone?: string | undefined;
      countryCode?: string | undefined;
      password: string;
    };

export type User = {
  id: number;
  username: string;
  email?: string;
  phone?: string;
};
export type RegisterAndLoginResponse = {
  token: string;
  refreshToken: string;
  user: User;
};
