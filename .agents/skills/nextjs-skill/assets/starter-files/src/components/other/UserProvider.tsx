"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import authService from "@/services/authService";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const hasInitialized = useRef(false);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!hasHydrated || hasInitialized.current) return;
    hasInitialized.current = true;

    async function initializeAuth() {
      useAuthStore.setState({ isLoading: true });

      try {
        const response = await authService.me();
        useAuthStore.setState({
          user: response.success ? response.data ?? null : null,
          isAuthenticated: response.success && Boolean(response.data),
          isLoading: false,
        });
      } catch {
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }

    initializeAuth();
  }, [hasHydrated]);

  if (!hasHydrated || isLoading) return null;

  return <>{children}</>;
}
