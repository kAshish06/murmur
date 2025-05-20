import { useForm } from "react-hook-form";
import { useState } from "react";
import Button from "../components/atoms/Button";
import { useLoginMutation } from "./query/authQuery";
import { type LoginPayload, type RegisterAndLoginResponse } from "./types";
import RotatingArrowLoader from "../components/customUtils/RotatingArrowLoader";

type Props = {
  onRegisterClick: (modal: "login" | "register") => void;
  onSuccess: (data: RegisterAndLoginResponse) => void;
  onError: () => void;
};

type LoginForm = {
  name: string;
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
  } = useForm<LoginForm>();

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
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email", { required: true })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">Email is required</p>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="w-1/3">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="countryCode"
                >
                  Code
                </label>
                <input
                  id="countryCode"
                  type="text"
                  placeholder="+91"
                  {...register("countryCode", { required: true })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="w-2/3">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="phone"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  type="text"
                  placeholder="9876543210"
                  {...register("phone", { required: true })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              {(errors.phone || errors.countryCode) && (
                <p className="text-sm text-red-500 mt-1">
                  Phone and country code are required
                </p>
              )}
            </div>
          )}

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", { required: true })}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">Password is required</p>
            )}
          </div>

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
