"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerWithCounts } from "./types";

type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export function CustomerForm({
  customer,
  onSuccess,
  onMutate,
}: {
  customer?: CustomerWithCounts;
  onSuccess?: () => void;
  onMutate?: () => void;
}) {
  const [state, setState] = useState<ActionState>({ success: false });
  const [isPending, setIsPending] = useState(false);
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setState({ success: false });

    const body = { name, phone };

    try {
      const url = customer
        ? `/api/customers/${customer.id}`
        : "/api/customers";
      const method = customer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({
          success: false,
          error: data.error,
          fieldErrors: data.fieldErrors,
        });
        return;
      }

      setState({ success: true });
      onMutate?.();
      onSuccess?.();
    } catch {
      setState({ success: false, error: "顧客の保存に失敗しました" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Label htmlFor="name">顧客名</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="山田 太郎"
          required
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.name[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor="phone">電話番号</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="090-1234-5678"
          required
        />
        {state.fieldErrors?.phone && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.phone[0]}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending
          ? "保存中..."
          : customer
            ? "更新する"
            : "顧客を作成"}
      </Button>
    </form>
  );
}
