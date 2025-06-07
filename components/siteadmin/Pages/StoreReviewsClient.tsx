"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    ColumnResizeMode,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Import our columns for reviews
import { createReviewColumns } from "@/app/dashboard/store-content/reviews/columns";
// Import server actions and types for store reviews
import {
    fetchStoreReviews,
    fetchStoreReviewById,
    createStoreReview,
    updateStoreReview,
    deleteStoreReview,
    StoreReview,
} from "@/app/actions/storeReviews";
import { Label } from "@/components/ui/label";

export default function StoreReviewsClient() {
    const [data, setData] = useState<StoreReview[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Table states
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    // Pagination state
    const [page, setPage] = useState<number>(1);
    const pageSize = 20;

    // Dialog states
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Selected review for update/view or deletion
    const [selectedReview, setSelectedReview] = useState<StoreReview | null>(null);

    // Form fields for create/update
    const [reviewName, setReviewName] = useState("");
    const [reviewBody, setReviewBody] = useState("");
    const [reviewStars, setReviewStars] = useState(5);
    const [reviewLink, setReviewLink] = useState("");

    // Fetch store reviews on mount (and page changes)
    useEffect(() => {
        const fetchData = async () => {
            const res = await fetchStoreReviews(page, pageSize);
            if (res.success) {
                setData(res.data);
            }
            setLoading(false);
        };
        fetchData();
    }, [page]);

    // Callback for opening the Create/Update dialog
    const onViewReview = async (reviewId: number) => {
        const res = await fetchStoreReviewById(reviewId);
        if (res.success && res.data) {
            setSelectedReview(res.data);
            setReviewName(res.data.name);
            setReviewBody(res.data.body);
            setReviewStars(res.data.stars);
            setReviewLink(res.data.link || "");
            setIsReviewDialogOpen(true);
        }
    };

    // Callback for opening the delete confirm dialog
    const onDeleteReview = (reviewId: number) => {
        const review = data.find((r) => r.id === reviewId);
        if (review) {
            setSelectedReview(review);
            setIsDeleteDialogOpen(true);
        }
    };

    // Handle form submit for create/update review
    const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (selectedReview) {
            // Update
            const res = await updateStoreReview(selectedReview.id, {
                name: reviewName,
                body: reviewBody,
                stars: reviewStars,
                link: reviewLink,
            });
            if (res.success) {
                const fetchRes = await fetchStoreReviews(page, pageSize);
                if (fetchRes.success) {
                    setData(fetchRes.data);
                }
                setIsReviewDialogOpen(false);
            } else {
                alert("Failed to update review: " + res.error);
            }
        } else {
            // Create
            const res = await createStoreReview({
                name: reviewName,
                body: reviewBody,
                stars: reviewStars,
                link: reviewLink,
            });
            if (res.success) {
                const fetchRes = await fetchStoreReviews(page, pageSize);
                if (fetchRes.success) {
                    setData(fetchRes.data);
                }
                setIsReviewDialogOpen(false);
            } else {
                alert("Failed to create review: " + res.error);
            }
        }
    };

    // Handle delete confirm
    const handleDeleteReview = async () => {
        if (selectedReview) {
            const res = await deleteStoreReview(selectedReview.id);
            if (res.success) {
                const fetchRes = await fetchStoreReviews(page, pageSize);
                if (fetchRes.success) {
                    setData(fetchRes.data);
                }
                setIsDeleteDialogOpen(false);
            } else {
                alert("Failed to delete review: " + res.error);
            }
        }
    };

    // Build table columns
    const reviewColumns = useMemo(
        () =>
            createReviewColumns({
                onViewReview,
                onDeleteReview,
            }),
        [onViewReview, onDeleteReview]
    );

    const table = useReactTable({
        data,
        columns: reviewColumns,
        enableColumnResizing: true,
        columnResizeMode: "onChange" as ColumnResizeMode,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        initialState: {
            pagination: { pageSize },
        },
    });

    return (
        <div className="w-full max-w-[1200px] mx-auto">
            {/* Header */}
            <Card className="w-full flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 mb-4">
                <h1 className="text-2xl font-semibold">Store Reviews</h1>
                <Button
                    onClick={() => {
                        setSelectedReview(null);
                        setReviewName("");
                        setReviewBody("");
                        setReviewStars(5);
                        setReviewLink("");
                        setIsReviewDialogOpen(true);
                    }}
                >
                    Create Review
                </Button>
            </Card>

            {/* Table */}
            <div className="w-full overflow-x-auto rounded-md border h-[600px]">
                <Table className="table-fixed w-full">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const canResize = header.column.getCanResize();
                                    const isResizing = header.column.getIsResizing();
                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{ width: header.getSize() }}
                                            className="whitespace-nowrap overflow-hidden relative"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                            {canResize && (
                                                <div
                                                    onMouseDown={header.getResizeHandler()}
                                                    onTouchStart={header.getResizeHandler()}
                                                    className={`absolute right-0 top-0 h-full w-2 cursor-col-resize select-none bg-transparent ${isResizing ? "bg-blue-500 opacity-40" : ""
                                                        }`}
                                                />
                                            )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={reviewColumns.length} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            style={{ width: cell.column.getSize() }}
                                            className="whitespace-nowrap overflow-hidden text-ellipsis"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={reviewColumns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                    Previous
                </Button>
                <span className="text-sm md:text-base lg:text-lg font-medium">
                    Page {page}
                </span>
                <Button variant="outline" onClick={() => setPage((prev) => prev + 1)}>
                    Next
                </Button>
            </div>

            {/* Create/Update Review Dialog */}
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedReview ? "Update Review" : "Create Review"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="reviewName">Name</Label>
                            <Input
                                id="reviewName"
                                value={reviewName}
                                onChange={(e) => setReviewName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="reviewBody">Body</Label>
                            <Input
                                id="reviewBody"
                                value={reviewBody}
                                onChange={(e) => setReviewBody(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="reviewStars">Stars</Label>
                            <Input
                                id="reviewStars"
                                type="number"
                                value={reviewStars}
                                onChange={(e) => setReviewStars(Number(e.target.value))}
                                min={1}
                                max={5}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="reviewLink">Link</Label>
                            <Input
                                id="reviewLink"
                                value={reviewLink}
                                onChange={(e) => setReviewLink(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="submit">{selectedReview ? "Update" : "Create"}</Button>
                            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                    </DialogHeader>
                    <p className="mt-2">Are you sure you want to delete this review?</p>
                    <DialogFooter>
                        <Button variant="destructive" onClick={handleDeleteReview}>
                            Delete
                        </Button>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}