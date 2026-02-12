"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StaffListClient } from "@/components/staff/staff-list-client";
import { StaffTableSkeleton } from "@/components/staff/staff-table-skeleton";
import type { StaffWithCounts } from "@/components/staff/types";

export function StaffContent() {
  const [staff, setStaff] = useState<StaffWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const searchRef = useRef(search);
  searchRef.current = search;

  const fetchStaff = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchRef.current) params.set("q", searchRef.current);
      const res = await fetch(`/api/staff?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchStaff]);

  if (loading) {
    return <StaffTableSkeleton />;
  }

  return (
    <StaffListClient
      staff={staff}
      onMutate={fetchStaff}
      search={search}
      onSearchChange={setSearch}
    />
  );
}
