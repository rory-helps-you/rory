"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StaffWithCounts } from "./types";

type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export function StaffForm({
  staff,
  onSuccess,
  onMutate,
}: {
  staff?: StaffWithCounts;
  onSuccess?: () => void;
  onMutate?: () => void;
}) {
  const [state, setState] = useState<ActionState>({ success: false });
  const [isPending, setIsPending] = useState(false);
  const [name, setName] = useState(staff?.name ?? "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setState({ success: false });

    const body = { name };

    try {
      const url = staff
        ? `/api/staff/${staff.id}`
        : "/api/staff";
      const method = staff ? "PUT" : "POST";

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
      setState({ success: false, error: "担当者の保存に失敗しました" });
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
        <Label htmlFor="name">担当者名</Label>
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

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending
          ? "保存中..."
          : staff
            ? "更新する"
            : "担当者を作成"}
      </Button>
    </form>
  );
}
