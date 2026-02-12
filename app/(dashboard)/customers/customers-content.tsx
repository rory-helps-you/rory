"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CustomerListClient } from "@/components/customers/customer-list-client";
import { CustomerTableSkeleton } from "@/components/customers/customer-table-skeleton";
import type { CustomerWithCounts } from "@/components/customers/types";

export function CustomersContent() {
  const [customers, setCustomers] = useState<CustomerWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const searchRef = useRef(search);
  searchRef.current = search;

  const fetchCustomers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchRef.current) params.set("q", searchRef.current);
      const res = await fetch(`/api/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchCustomers]);

  if (loading) {
    return <CustomerTableSkeleton />;
  }

  return (
    <CustomerListClient
      customers={customers}
      onMutate={fetchCustomers}
      search={search}
      onSearchChange={setSearch}
    />
  );
}
