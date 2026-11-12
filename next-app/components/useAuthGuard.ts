"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isAuthenticated,
  getDecodedToken,
  DecodedToken,
} from "@/lib/auth";

export function useAuthGuard(redirectTo: string = "/login") {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const valid = isAuthenticated();

    if (!valid) {
      setIsAuthorized(false);
      router.replace(redirectTo);
    } else {
      setUser(getDecodedToken());
      setIsAuthorized(true);
    }
  }, [router, redirectTo]);

  return { isAuthorized, user };
}