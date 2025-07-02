import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../components/atoms/Button";
import { useRegisterUserMutation } from "./query/authQuery";
import type { RegisterUserPayload, RegisterAndLoginResponse } from "./types";
import RotatingArrowLoader from "../components/customUtils/RotatingArrowLoader";
import InputField from "../components/atoms/InputField";
import useLocalStorage from "../hooks/useLocalStorage";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants";

type Props = {
  closeModal: () => void;
};

export default function Register({ closeModal }: Props) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const accessToken = useLocalStorage(ACCESS_TOKEN_KEY, "");
  const refreshToken = useLocalStorage(REFRESH_TOKEN_KEY, "");
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const onSuccess = (data: RegisterAndLoginResponse) => {
    closeModal();
    accessToken[1](data.token);
    refreshToken[1](data.refreshToken);
    setUser(data.user);
    navigate("/conversations");
  };
  const onError = () => {
    // Notify user about failure via toast
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<RegisterUserPayload>();
  const registerUserMutation = useRegisterUserMutation(onSuccess, onError);
  useEffect(() => {
    setFocus("username");
  }, [setFocus, method]);

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
          <InputField
            label="Name"
            id="name"
            type="text"
            placeholder="Jane Doe"
            registration={register("username", {
              required: "Name is required",
            })}
            error={errors.username}
          />

          {method === "email" ? (
            <InputField
              label="Email"
              id="email"
              type="email"
              placeholder="you@example.com"
              registration={register("email", {
                required:
                  method === "email"
                    ? "Email is required for email registration"
                    : false,
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
                      method === "phone"
                        ? "Country Code is required for phone registration"
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
                      method === "phone"
                        ? "Phone number is required for phone registration"
                        : false,
                    pattern: {
                      value: /^[0-9]{7,15}$/,
                      message: "Invalid phone number format (7-15 digits)",
                    },
                  })}
                  error={errors.phone}
                />
              </div>
              {(errors.phone || errors.countryCode) &&
                !errors.phone?.message &&
                !errors.countryCode?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    Phone and country code are required for phone registration.
                  </p>
                )}
            </div>
          )}

          <InputField
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            registration={register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={errors.password}
          />

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
      </div>
    </div>
  );
}
