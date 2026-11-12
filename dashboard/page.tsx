
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDecodedToken,
  isAuthenticated,
  removeToken,
} from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface DashboardItem {
  id: number | string;
  name: string;
  status: string;
  createdAt?: string;
}

interface DashboardUser {
  name?: string;
  email?: string;
  role?: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const validSession = isAuthenticated();

    if (!validSession) {
      router.replace("/login");
      return;
    }

    const decodedUser = getDecodedToken() as DashboardUser | null;

    setUser(decodedUser);
    setIsAuthorized(true);

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await api.get<DashboardItem[]>("/items");

        setItems(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load data.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.replace("/login");
  };

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Verifying session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard
            </h1>

            <p className="text-muted-foreground">
              Welcome back, {user?.name || user?.email || "User"}
            </p>
          </div>

          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* User Information */}
        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-xl border p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Account Email
            </p>

            <h2 className="mt-2 truncate text-lg font-semibold">
              {user?.email || "N/A"}
            </h2>
          </div>

          <div className="rounded-xl border p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Role
            </p>

            <h2 className="mt-2 text-lg font-semibold capitalize">
              {user?.role || "Member"}
            </h2>
          </div>

          <div className="rounded-xl border p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Total Records
            </p>

            <h2 className="mt-2 text-lg font-semibold">
              {items.length}
            </h2>
          </div>

        </div>

        {/* Records Table */}
        <div className="rounded-xl border shadow-sm">

          <div className="border-b p-6">
            <h2 className="text-xl font-semibold">
              Recent Records
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Data fetched from your protected backend API.
            </p>
          </div>

          <div className="overflow-x-auto p-6">

            {loading ? (
              <p className="text-sm text-muted-foreground">
                Loading records...
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">
                {error}
              </p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No records found.
              </p>
            ) : (
              <table className="w-full text-left text-sm">

                <thead>
                  <tr className="border-b">
                    <th className="p-3 font-semibold">ID</th>
                    <th className="p-3 font-semibold">Name</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-0"
                    >
                      <td className="p-3 font-medium">
                        {item.id}
                      </td>

                      <td className="p-3">
                        {item.name}
                      </td>

                      <td className="p-3">
                        {item.status}
                      </td>

                      <td className="p-3">
                        {item.createdAt || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
