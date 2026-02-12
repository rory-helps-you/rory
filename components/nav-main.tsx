"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, CirclePlusIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ReservationDrawer } from "@/components/reservations/reservation-drawer";

function CollapsibleNavItem({
  group,
  pathname,
}: {
  group: { title: string; icon: React.ReactNode; items: { title: string; url: string }[] };
  pathname: string;
}) {
  const isGroupActive = group.items.some((item) =>
    pathname.startsWith(item.url)
  );
  const [open, setOpen] = useState(isGroupActive);

  return (
    <Collapsible open={open || isGroupActive} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={<SidebarMenuButton isActive={isGroupActive} />}
        >
          {group.icon}
          <span>{group.title}</span>
          <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[panel-open]:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.items.map((item) => (
              <SidebarMenuSubItem key={item.url}>
                <SidebarMenuSubButton
                  isActive={pathname === item.url}
                  render={<Link href={item.url} />}
                >
                  <span>{item.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function NavMain({
  items,
  collapsibles,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
  }[];
  collapsibles?: {
    title: string;
    icon: React.ReactNode;
    items: { title: string; url: string }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <ReservationDrawer
              trigger={
                <SidebarMenuButton
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                >
                  <CirclePlusIcon />
                  <span>新規予約</span>
                </SidebarMenuButton>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              item.url === "/"
                ? pathname === "/"
                : pathname.startsWith(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={isActive}
                  render={<Link href={item.url} />}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          {collapsibles?.map((group) => (
            <CollapsibleNavItem key={group.title} group={group} pathname={pathname} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
