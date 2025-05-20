import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../components/atoms/Button";
import { useRegisterUserMutation } from "./query/authQuery";
import type { RegisterUserPayload, RegisterAndLoginResponse } from "./types";
import RotatingArrowLoader from "../components/customUtils/RotatingArrowLoader";

type Props = {
  onLoginClick: (modal: "login" | "register") => void;
  onSuccess: (data: RegisterAndLoginResponse) => void;
  onError: () => void;
};

export default function Register({ onLoginClick, onSuccess, onError }: Props) {
  const [method, setMethod] = useState<"email" | "phone">("email");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterUserPayload>();
  const registerUserMutation = useRegisterUserMutation(onSuccess, onError);

  const onSubmit = async (data: RegisterUserPayload) => {
    console.log("Form Data:", data);
    const commonPayload = {
      password: data.password,
      username: data.username,
    };
    const registerData: RegisterUserPayload =
      method === "email"
        ? {
            ...commonPayload,
            email: data.email,
          }
        : {
            ...commonPayload,
            countryCode: data.countryCode,
            phone: data.phone,
          };
    await registerUserMutation.mutateAsync(registerData);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create your Murmur account
        </h2>

        <div className="flex justify-center gap-4 mb-6 text-sm font-medium">
          <Button
            btnType={method === "email" ? "primary" : "secondary"}
            onClick={() => setMethod("email")}
          >
            Register with Email
          </Button>
          <Button
            btnType={method === "phone" ? "primary" : "secondary"}
            onClick={() => setMethod("phone")}
          >
            Register with Phone
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              {...register("username", { required: true })}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Jane Doe"
            />
            {errors.username && (
              <span className="text-xs text-red-500">Name is required</span>
            )}
          </div>
          {method === "email" ? (
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email", {
                  required: true,
                  pattern: /^\S+@\S+$/i,
                })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="you@example.com"
              />
              {errors.email && (
                <span className="text-xs text-red-500">
                  Valid email is required
                </span>
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
                  {...register("countryCode", { required: true })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="+91"
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
                  type="tel"
                  {...register("phone", {
                    required: true,
                    pattern: /^[0-9]{7,15}$/,
                  })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="9876543210"
                />
              </div>
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
              {...register("password", { required: true, minLength: 6 })}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-xs text-red-500">
                Password must be at least 6 characters
              </span>
            )}
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={registerUserMutation.isPending}
          >
            {registerUserMutation.isPending ? (
              <RotatingArrowLoader>Registering…</RotatingArrowLoader>
            ) : (
              "Register"
            )}
          </Button>
        </form>

        <p className="text-center text-sm mt-8">
          Already have an account?{" "}
          <Button btnType="link" onClick={() => onLoginClick("login")}>
            Login
          </Button>
        </p>
      </div>
    </div>
  );
}
