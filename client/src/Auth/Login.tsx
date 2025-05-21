import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Button from "../components/atoms/Button";
import { useLoginMutation } from "./query/authQuery";
import { type LoginPayload, type RegisterAndLoginResponse } from "./types";
import RotatingArrowLoader from "../components/customUtils/RotatingArrowLoader";
import InputField from "../components/atoms/InputField";

type Props = {
  onRegisterClick: (modal: "login" | "register") => void;
  onSuccess: (data: RegisterAndLoginResponse) => void;
  onError: () => void;
};

type LoginForm = {
  email?: string;
  phone?: string;
  countryCode?: string;
  password: string;
};

export default function Login({ onRegisterClick, onSuccess, onError }: Props) {
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const loginMutation = useLoginMutation(onSuccess, onError);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginForm>();
  useEffect(() => {
    setFocus(loginMethod);
  }, [setFocus, loginMethod]);

  const onSubmit = async (data: LoginForm) => {
    console.log("Login Data:", data);
    const commonPayload = {
      password: data.password,
    };
    const loginData: LoginPayload =
      loginMethod === "email"
        ? {
            ...commonPayload,
            email: data.email,
          }
        : {
            ...commonPayload,
            countryCode: data.countryCode,
            phone: data.phone,
          };
    await loginMutation.mutateAsync(loginData);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to Murmur</h2>

        <div className="flex justify-center mb-4 gap-4">
          <Button
            btnType={loginMethod === "email" ? "primary" : "secondary"}
            onClick={() => setLoginMethod("email")}
          >
            Email
          </Button>
          <Button
            btnType={loginMethod === "phone" ? "primary" : "secondary"}
            onClick={() => setLoginMethod("phone")}
          >
            Phone
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {loginMethod === "email" ? (
            <InputField
              label="Email"
              id="email"
              type="email"
              placeholder="you@example.com"
              registration={register("email", {
                required: loginMethod === "email" ? "Email is required" : false,
                pattern: {
                  value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i,
                  message: "Invalid email address",
                },
              })}
              error={errors.email}
            />
          ) : (
            <div className="flex gap-2">
              <div className="w-1/3">
                <InputField
                  label="Code"
                  id="countryCode"
                  type="text"
                  placeholder="+91"
                  registration={register("countryCode", {
                    required:
                      loginMethod === "phone"
                        ? "Country Code is required"
                        : false,
                  })}
                  error={errors.countryCode}
                  inputClassName="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="w-2/3">
                <InputField
                  label="Phone"
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  registration={register("phone", {
                    required:
                      loginMethod === "phone"
                        ? "Phone number is required"
                        : false,
                    pattern: {
                      value: /^[0-9]{7,15}$/,
                      message: "Invalid phone number format (7-15 digits)",
                    },
                  })}
                  error={errors.phone}
                />
              </div>
            </div>
          )}

          <InputField
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            registration={register("password", {
              required: "Password is required",
            })}
            error={errors.password}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <RotatingArrowLoader>Logging in ...</RotatingArrowLoader>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <p className="text-center text-sm mt-8">
          Don’t have an account?{" "}
          <Button btnType="link" onClick={() => onRegisterClick("register")}>
            Register
          </Button>
        </p>
      </div>
    </div>
  );
}
