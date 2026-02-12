"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  UsersIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
} from "lucide-react";

const data = {
  shops: [
    { name: "Rory 渋谷店", plan: "スタンダード" },
  ],
  user: {
    name: "オーナー",
    email: "owner@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "ダッシュボード",
      url: "/",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "スケジュール",
      url: "/schedule",
      icon: <CalendarDaysIcon />,
    },
    {
      title: "予約管理",
      url: "/reservations",
      icon: <ClipboardListIcon />,
    },
    {
      title: "顧客管理",
      url: "/customers",
      icon: <UsersIcon />,
    },
  ],
  navSettings: {
    title: "設定",
    icon: <Settings2Icon />,
    items: [
      { title: "担当者", url: "/settings/staff" },
      { title: "メニュー", url: "/settings/menu" },
    ],
  },
  navSecondary: [
    {
      title: "ヘルプ",
      url: "#",
      icon: <CircleHelpIcon />,
    },
    {
      title: "検索",
      url: "#",
      icon: <SearchIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <TeamSwitcher shops={data.shops} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} collapsibles={[data.navSettings]} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
