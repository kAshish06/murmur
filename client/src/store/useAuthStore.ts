import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../Auth/types";

interface AuthStore {
  user: User | null;
  setUser: (user: User) => void;
}
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        setUser: (user: User) => set({ user }),
      }),
      {
        name: "user",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
