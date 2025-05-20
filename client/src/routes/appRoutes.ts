import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

export interface AppRoute {
  /** Unique name (used as key on mobile) */
  name: string;
  /** Web path (ignored on mobile if you use React Navigation) */
  path: string;
  /** Component to render */
  component: LazyExoticComponent<ComponentType<unknown>>;
  /** Whether this screen is protected */
  isProtected?: boolean;
}

export const appRoutes: AppRoute[] = [
  {
    name: "home",
    path: "/",
    component: lazy(() => import("../LandingPage/LandingPage")),
  },
  {
    name: "Chat",
    path: "/chat",
    component: lazy(() => import("../Conversations/Conversations")),
    isProtected: true,
  },
];
