"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { removeToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DashboardItem {
  id: number | string;
  name: string;
  status: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthorized, user } = useAuthGuard("/login");

  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isAuthorized) return;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Palitan ang "/items" o "/users" ng actual protected endpoint ng backend mo
        const data = await api.get<DashboardItem[]>("/items");
        setItems(Array.isArray(data) ? data : []);
      } catch (err: any) {
        // Kung wala pang endpoint sa backend, hindi magka-crash ang UI
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [isAuthorized]);

  const handleLogout = () => {
    removeToken();
    router.replace("/login");
  };

  // Huwag ipakita ang dashboard habang vine-verify ang JWT token
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header & Logout */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || user?.email || "User"}
            </p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* User Info / Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Account Email</CardDescription>
              <CardTitle className="text-lg truncate">
                {user?.email || "N/A"}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Role</CardDescription>
              <CardTitle className="text-lg capitalize">
                {user?.role || "Member"}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Records</CardDescription>
              <CardTitle className="text-lg">{items.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Data Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Records</CardTitle>
            <CardDescription>
              Data fetched from your protected backend API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading records...</p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No records found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>{item.createdAt || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}