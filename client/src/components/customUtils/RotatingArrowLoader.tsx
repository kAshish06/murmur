import { type ReactNode } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

type props = {
  children: ReactNode;
};
export default function RotatingArrowLoader({ children }: props) {
  return (
    <>
      <ArrowPathIcon className="h-5 w-5 animate-spin" />
      {children}
    </>
  );
}
