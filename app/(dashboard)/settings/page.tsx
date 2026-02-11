import { SiteHeader } from "@/components/site-header";

export default function SettingsPage() {
  return (
    <>
      <SiteHeader title="設定" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <p className="text-muted-foreground text-sm">準備中です</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
