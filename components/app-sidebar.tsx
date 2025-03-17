"use client"

import * as React from "react"
import {
    AudioWaveform,
    BookOpen,
    Bot,
    ChevronRightIcon,
    Command,
    GalleryVerticalEnd,
    Search,
    Settings2,
    SquareTerminal,
    Store,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
    },
    teams: [
        {
            name: "Acme Inc",
            logo: GalleryVerticalEnd,
            plan: "Enterprise",
        },
        {
            name: "Acme Corp.",
            logo: AudioWaveform,
            plan: "Startup",
        },
        {
            name: "Evil Corp.",
            logo: Command,
            plan: "Free",
        },
    ],
    navMain: [
        {
            title: "Playground",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: "History",
                    url: "#",
                },
                {
                    title: "Starred",
                    url: "#",
                },
                {
                    title: "Settings",
                    url: "#",
                },
            ],
        },
        {
            title: "Models",
            url: "#",
            icon: Bot,
            items: [
                {
                    title: "Genesis",
                    url: "#",
                },
                {
                    title: "Explorer",
                    url: "#",
                },
                {
                    title: "Quantum",
                    url: "#",
                },
            ],
        },
        {
            title: "Documentation",
            url: "#",
            icon: BookOpen,
            items: [
                {
                    title: "Introduction",
                    url: "#",
                },
                {
                    title: "Get Started",
                    url: "#",
                },
                {
                    title: "Tutorials",
                    url: "#",
                },
                {
                    title: "Changelog",
                    url: "#",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Team",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Limits",
                    url: "#",
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: "Analytics",
            url: "#",
            items: [
                {
                    title: "GA4 Analytics",
                    url: "/dashboard/analytics/ga4-analytics",
                },
            ],
        },
        {
            title: "Product Content",
            url: "#",
            items: [
                {
                    title: "Vapes",
                    url: "/dashboard/product-content/vapes",
                },
                {
                    title: "Hemp Flowers",
                    url: "/dashboard/product-content/hemp-flowers",
                },
                {
                    title: "Deals & Promos",
                    url: "/dashboard/product-content/deals-&-promos",
                },
            ],
        },
        {
            title: "Store Content",
            url: "#",
            items: [
                {
                    title: "Reviews",
                    url: "/dashboard/store-content/reviews",
                },
                {
                    title: "Gallery",
                    url: "/dashboard/store-content/gallery",
                },
            ],
        },
        {
            title: "Documents",
            url: "#",
            items: [
                {
                    title: "Hemp Lab Certificates",
                    url: "/dashboard/documents/hemp-coa",
                },
                {
                    title: "Hemp Label Maker",
                    url: "/dashboard/documents/hemp-label-maker",
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="w-full flex items-center justify-center pt-4">
                <SidebarGroup className="py-0">
                    <SidebarGroupContent className="w-full flex flex-row items-center justify-start gap-x-4">
                        {/* Ensure the Store icon always remains visible */}
                        <Store className="w-6 h-6 shrink-0" />

                        {/* Hide the title when the sidebar is collapsed */}
                        <h1 className="text-[22px] font-bold text-center group-data-[collapsible=icon]:hidden">
                            Inhale Bay Admin
                        </h1>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarHeader>
            <SidebarContent>
                {/* <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarMenu>
                        {data.navMain.map((item) => (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={item.isActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip={item.title}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild>
                                                        <a href={subItem.url}>
                                                            <span>{subItem.title}</span>
                                                        </a>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        ))}
                    </SidebarMenu>
                </SidebarGroup> */}
                <SidebarGroup className="group-data-[collapsible=icon]:hidden px-4 mt-4 gap-6">
                    {data.navSecondary.map((section) => (
                        <div key={section.title}>
                            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                            <SidebarMenu>
                                {section.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url} className="flex items-center gap-2">
                                                <span>
                                                    {item.title}
                                                </span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </div>
                    ))}
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}