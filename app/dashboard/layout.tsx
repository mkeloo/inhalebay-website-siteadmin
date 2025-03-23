import { cookies } from "next/headers"

import { AppSidebar } from "@/components/app-sidebar"
import { ModeSwitcher } from "@/components/mode-switcher"
import { NavHeader } from "@/components/nav-header"
import { ThemeSelector } from "@/components/theme-selector"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"

export default async function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <SidebarInset className="h-full">
                <header className="bg-background sticky inset-x-0 top-0 isolate z-10 flex shrink-0 items-center gap-2">
                    <div className="flex h-14 w-full items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1.5" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <NavHeader />
                        <div className="ml-auto flex items-center gap-2">
                            <ThemeSelector />
                            <ModeSwitcher />
                        </div>
                    </div>
                </header>
                {/* Main Content Area */}
                <Card className="p-4 min-h-[calc(100vh-4rem)] w-full z-1">
                    {children}
                </Card>
            </SidebarInset>
        </SidebarProvider>
    )
}
