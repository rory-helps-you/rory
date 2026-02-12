"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import liff from "@line/liff";

type Profile = {
  displayName: string;
  userId: string;
  pictureUrl?: string;
  statusMessage?: string;
};

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; profile: Profile };

  
const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? "";

export default function LiffReservationPage() {
  const [state, setState] = useState<State>(
    LIFF_ID ? { status: "loading" } : { status: "error", message: "LIFF IDが設定されていません" }
  );

  useEffect(() => {
    if (!LIFF_ID) return;

    liff
      .init({ liffId: LIFF_ID })
      .then(() => {
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }
        return liff.getProfile();
      })
      .then((p) => {
        if (p) setState({ status: "ready", profile: p });
      })
      .catch((e: Error) => {
        setState({ status: "error", message: e.message });
      });
  }, []);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-destructive">{state.message}</p>
      </div>
    );
  }

  const { profile } = state;

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">予約ページ</h1>
        <div className="mt-6 flex flex-col items-center gap-3">
          {profile.pictureUrl && (
            <Image
              src={profile.pictureUrl}
              alt={profile.displayName}
              width={80}
              height={80}
              className="rounded-full"
            />
          )}
          <p className="text-lg font-semibold">{profile.displayName}</p>
          {profile.statusMessage && (
            <p className="text-sm text-muted-foreground">
              {profile.statusMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
