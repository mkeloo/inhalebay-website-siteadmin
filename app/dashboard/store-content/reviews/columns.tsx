import { ColumnDef } from "@tanstack/react-table"
import { StoreReview } from "../../../actions/storeReviews"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

/**
 * Define callbacks to handle row actions:
 *  - onViewReview: e.g., open a dialog to show this review in detail
 *  - onDeleteReview: e.g., confirm and remove the review
 */
interface CreateReviewColumnsProps {
    onViewReview: (reviewId: number) => void
    onDeleteReview: (reviewId: number) => void
}

/**
 * Create columns for the store_reviews table using TanStack Table.
 */
export function createReviewColumns({
    onViewReview,
    onDeleteReview,
}: CreateReviewColumnsProps): ColumnDef<StoreReview>[] {
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
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        ID
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("id")}</div>,
            size: 80,
            minSize: 80,
        },
        // Name column
        {
            accessorKey: "name",
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("name")}</div>,
            size: 150,
            minSize: 120,
        },
        // Body column
        {
            accessorKey: "body",
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Body
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("body")}</div>,
            size: 250,
            minSize: 150,
        },
        // Stars column
        {
            accessorKey: "stars",
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Stars
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("stars")}</div>,
            size: 80,
            minSize: 80,
        },
        // Link column
        {
            accessorKey: "link",
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Link
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const link = row.getValue<string>("link")
                if (!link) return <div className="text-center">N/A</div>
                return (
                    <div className="text-center">
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-600"
                        >
                            Open
                        </a>
                    </div>
                )
            },
            size: 180,
        },
        // Created at column
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Created At
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const rawVal = row.getValue<string>("created_at")
                const dateStr = rawVal ? new Date(rawVal).toLocaleString() : "N/A"
                return <div className="text-center">{dateStr}</div>
            },
            size: 160,
        },
        // Updated at column
        {
            accessorKey: "updated_at",
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Updated At
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const rawVal = row.getValue<string>("updated_at")
                const dateStr = rawVal ? new Date(rawVal).toLocaleString() : "N/A"
                return <div className="text-center">{dateStr}</div>
            },
            size: 160,
        },
        // Actions column
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const review = row.original
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
                                <DropdownMenuItem onClick={() => onViewReview(review.id)}>
                                    View Review
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDeleteReview(review.id)}>
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
            size: 100,
        },
    ]
}