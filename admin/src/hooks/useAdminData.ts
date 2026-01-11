"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { adminApiRequest } from "@/lib/adminApi";

export function useAdminData() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await adminApiRequest("get-dashboard");
      setData(res);
    } catch (err: any) {
      if (err.status === 401 || err.message?.includes("Unauthorized")) {
        localStorage.removeItem("isAdminLoggedIn");
        localStorage.removeItem("adminToken");
        router.push("/login");
      }
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}
