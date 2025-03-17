import { ColumnDef } from "@tanstack/react-table";
import { updateVapeDealEnabled, VapeDeal } from "../../../actions/vapesDeals";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

interface CreateVapeDealColumnsProps {
    onViewDeal: (dealId: number) => void;
    onDeleteDeal: (dealId: number) => void;
    baseUrl: string;
}

export function createVapeDealColumns({
    onViewDeal,
    onDeleteDeal,
    baseUrl,
}: CreateVapeDealColumnsProps): ColumnDef<VapeDeal>[] {


    return [
        // SELECT (checkbox) column
        {
            id: "select",
            header: ({ table }) => (
                <div className="text-center">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
            size: 50,
        },
        // ID column
        {
            accessorKey: "id",
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        ID
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("id")}</div>,
            size: 80,
        },
        // Vape Company column
        {
            accessorKey: "vape_company",
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Vape Company
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">{row.getValue("vape_company")}</div>
            ),
            size: 150,
        },
        // Buy 1 Price column
        {
            accessorKey: "buy_1_price",
            header: ({ column }) => (
                <div className="text-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Buy 1 Price
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">${row.getValue("buy_1_price")}</div>
            ),
            size: 100,
        },
        // Buy 2 Price column
        {
            accessorKey: "buy_2_price",
            header: ({ column }) => (
                <div className="text-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Buy 2 Price
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">${row.getValue("buy_2_price")}</div>
            ),
            size: 100,
        },
        // Discount Percent column
        {
            accessorKey: "discount_percent",
            header: ({ column }) => (
                <div className="text-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Discount %
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">{row.getValue("discount_percent")}%</div>
            ),
            size: 100,
        },
        // Deal Tagline column
        {
            accessorKey: "deal_tagline",
            header: ({ column }) => (
                <div className="text-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Deal Tagline
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("deal_tagline")}</div>,
            size: 200,
        },
        // Short Title column
        {
            accessorKey: "short_title",
            header: ({ column }) => (
                <div className="text-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Short Title
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("short_title")}</div>,
            size: 150,
        },
        // Image column
        {
            accessorKey: "image_src",
            header: ({ column }) => (
                <div className="text-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Image
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">
                    <img
                        src={`${baseUrl}/${row.getValue("image_src")}`}
                        alt="deal image"
                        className="h-10 w-auto mx-auto"
                    />
                </div>
            ),
            size: 120,
        },
        // NEW: Enabled column
        {
            accessorKey: "is_enabled",
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Enabled
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const enabled = row.getValue<boolean>("is_enabled");
                return (
                    <div className="text-center">
                        <Switch
                            checked={enabled}
                            onCheckedChange={async (checked) => {
                                const id = row.getValue<number>("id");
                                const res = await updateVapeDealEnabled(id, checked);
                                if (!res.success) {
                                    alert("Failed to update status: " + res.error);
                                }
                            }}
                        />
                    </div>
                );
            },
            size: 80,
        },

        // BG Gradient column
        {
            accessorKey: "bg_gradient",
            header: ({ column }) => (
                <div className="text-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        BG Gradient
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("bg_gradient")}</div>,
            size: 120,
        },
        // Created At column
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <div className="text-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Created At
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const rawVal = row.getValue<string>("created_at");
                const dateStr = rawVal ? new Date(rawVal).toLocaleString() : "N/A";
                return <div className="text-center">{dateStr}</div>;
            },
            size: 160,
        },
        // Updated At column
        {
            accessorKey: "updated_at",
            header: ({ column }) => (
                <div className="text-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Updated At
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const rawVal = row.getValue<string>("updated_at");
                const dateStr = rawVal ? new Date(rawVal).toLocaleString() : "N/A";
                return <div className="text-center">{dateStr}</div>;
            },
            size: 160,
        },
        // Actions column
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const deal = row.original;
                return (
                    <div className="flex items-center justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onViewDeal(deal.id)}>
                                    View Deal
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDeleteDeal(deal.id)}>
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
            size: 100,
        },
    ];
}