"use client";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  CalendarIcon,
  UsersIcon,
  SettingsIcon,
  ScissorsIcon,
} from "lucide-react";
import Link from "next/link";

const navItems = [
  {
    title: "ダッシュボード",
    url: "/",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "予約管理",
    url: "/reservations",
    icon: <CalendarIcon />,
  },
  {
    title: "顧客管理",
    url: "/customers",
    icon: <UsersIcon />,
  },
  {
    title: "設定",
    url: "/settings",
    icon: <SettingsIcon />,
  },
];

const user = {
  name: "オーナー",
  email: "owner@example.com",
  avatar: "",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ScissorsIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold">Rory</span>
                <span className="truncate text-xs">無断キャンセル予測</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
