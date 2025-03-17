"use client";

import React, { useState, useEffect, useMemo } from "react";
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

import { createHempFlowerDealsColumns } from "./columns";
import {
    fetchFlowerBudDeals,
    fetchFlowerBudDealById,
    createFlowerBudDealWithFile,
    updateFlowerBudDealWithFile,
    deleteFlowerBudDeal,
    fetchMediaBucketUrl,
    FlowerBudDeal,
} from "../../../actions/hempFlowerDeals";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { ArrowUpDown } from "lucide-react";

export default function HempFlowerDealsPage() {
    const [data, setData] = useState<FlowerBudDeal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Table states
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    // For dialogs/sheet
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Media base URL (e.g. "https://dnltndrwudjaskjwczvm.supabase.co/storage/v1/object/public/inhale-bay-website")
    const [mediaBaseUrl, setMediaBaseUrl] = useState<string>("");

    // Selected deal for editing/deleting
    const [selectedDeal, setSelectedDeal] = useState<FlowerBudDeal | null>(null);

    // States for creating a new deal
    const [newBudName, setNewBudName] = useState("");
    const [newOneGramPrice, setNewOneGramPrice] = useState("");
    const [newFourGramPrice, setNewFourGramPrice] = useState("");
    const [newBgGradient, setNewBgGradient] = useState("");
    const [newFile, setNewFile] = useState<File | null>(null);

    // States for updating an existing deal (used in the sheet)
    const [editBudName, setEditBudName] = useState("");
    const [editOneGramPrice, setEditOneGramPrice] = useState("");
    const [editFourGramPrice, setEditFourGramPrice] = useState("");
    const [editBgGradient, setEditBgGradient] = useState("");
    const [editFile, setEditFile] = useState<File | null>(null);

    // Pagination state
    const [page, setPage] = useState<number>(1);
    const pageSize = 20;
    // Compute total pages
    const totalPages = Math.ceil(data.length / pageSize);
    const isFirstPage = page === 1;
    const isLastPage = page === totalPages;


    // Fetch all deals and media base URL on mount
    useEffect(() => {
        const fetchAll = async () => {
            const baseUrl = await fetchMediaBucketUrl();
            setMediaBaseUrl(baseUrl);
            const res = await fetchFlowerBudDeals();
            if (res.success) {
                setData(res.data);
            }
            setLoading(false);
        };
        fetchAll();
    }, []);

    // Table columns (pass mediaBaseUrl to columns)
    const columns = useMemo(
        () =>
            createHempFlowerDealsColumns({
                onViewDeal: handleEditDeal,
                onDeleteDeal: handleDeleteDeal,
                baseUrl: mediaBaseUrl,
            }),
        [mediaBaseUrl]
    );

    const table = useReactTable({
        data,
        columns,
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

    // ========== CREATE NEW DEAL ==========
    function openCreateDialog() {
        setNewBudName("");
        setNewOneGramPrice("");
        setNewFourGramPrice("");
        setNewBgGradient("");
        setNewFile(null);
        setIsCreateDialogOpen(true);
    }

    async function handleCreateDeal(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("bud_name", newBudName);
        formData.append("one_gram_price", newOneGramPrice || "0");
        formData.append("four_gram_price", newFourGramPrice || "0");
        formData.append("bg_gradient", newBgGradient);
        if (newFile) formData.append("file", newFile);

        const res = await createFlowerBudDealWithFile(formData);
        if (res.success) {
            const dealsRes = await fetchFlowerBudDeals();
            if (dealsRes.success) {
                setData(dealsRes.data);
            }
            setIsCreateDialogOpen(false);
        } else {
            alert("Failed to create deal: " + res.error);
        }
    }

    // ========== EDIT DEAL (SHEET) ==========
    async function handleEditDeal(dealId: number) {
        const res = await fetchFlowerBudDealById(dealId);
        if (res.success && res.data) {
            setSelectedDeal(res.data);
            setEditBudName(res.data.bud_name);
            setEditOneGramPrice(String(res.data.one_gram_price));
            setEditFourGramPrice(String(res.data.four_gram_price));
            setEditBgGradient(res.data.bg_gradient);
            setEditFile(null);
            setIsEditSheetOpen(true);
        }
    }

    async function handleUpdateDeal(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!selectedDeal) return;
        const formData = new FormData();
        formData.append("bud_name", editBudName);
        formData.append("one_gram_price", editOneGramPrice || "0");
        formData.append("four_gram_price", editFourGramPrice || "0");
        formData.append("bg_gradient", editBgGradient);
        if (editFile) formData.append("file", editFile);

        const res = await updateFlowerBudDealWithFile(selectedDeal.id, formData);
        if (res.success) {
            const dealsRes = await fetchFlowerBudDeals();
            if (dealsRes.success) {
                setData(dealsRes.data);
            }
            setIsEditSheetOpen(false);
        } else {
            alert("Failed to update deal: " + res.error);
        }
    }

    // ========== DELETE DEAL ==========
    function handleDeleteDeal(dealId: number) {
        const toDelete = data.find((d) => d.id === dealId);
        if (toDelete) {
            setSelectedDeal(toDelete);
            setIsDeleteDialogOpen(true);
        }
    }

    async function confirmDeleteDeal() {
        if (!selectedDeal) return;
        const res = await deleteFlowerBudDeal(selectedDeal.id);
        if (res.success) {
            const dealsRes = await fetchFlowerBudDeals();
            if (dealsRes.success) {
                setData(dealsRes.data);
            }
        } else {
            alert("Failed to delete deal: " + res.error);
        }
        setIsDeleteDialogOpen(false);
    }

    return (
        <div className="w-full max-w-[1200px] mx-auto">
            {/* Header */}
            <Card className="w-full flex flex-row items-center justify-between gap-4 px-6 py-4 mb-4">
                <h1 className="text-2xl font-semibold">Flower Bud Deals</h1>
                <Button onClick={openCreateDialog}>Create Deal</Button>
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <Button variant="outline" disabled={isFirstPage} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                    Previous
                </Button>
                <span className="text-lg font-medium">Page {page}</span>
                <Button variant="outline" disabled={isLastPage} onClick={() => setPage((prev) => prev + 1)}>
                    Next
                </Button>
            </div>


            {/* CREATE DEAL DIALOG */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Deal</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateDeal} className="space-y-4">
                        <div>
                            <Label htmlFor="newBudName">Bud Name</Label>
                            <Input
                                id="newBudName"
                                value={newBudName}
                                onChange={(e) => setNewBudName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>1g Price</Label>
                                <Input
                                    type="number"
                                    value={newOneGramPrice}
                                    onChange={(e) => setNewOneGramPrice(e.target.value)}
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <Label>4g Price</Label>
                                <Input
                                    type="number"
                                    value={newFourGramPrice}
                                    onChange={(e) => setNewFourGramPrice(e.target.value)}
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <Label>BG Gradient</Label>
                            <Input
                                placeholder="e.g. from-green-500 to-blue-500"
                                value={newBgGradient}
                                onChange={(e) => setNewBgGradient(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label>Image File</Label>
                            <Input type="file" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Create</Button>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT DEAL SHEET */}
            <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                <SheetContent className="w-[400px]">
                    <SheetHeader>
                        <SheetTitle>Edit Deal</SheetTitle>
                    </SheetHeader>
                    {selectedDeal && (
                        <form onSubmit={handleUpdateDeal} className="space-y-4 mt-4">
                            {selectedDeal.image_src && (
                                <img
                                    src={mediaBaseUrl + selectedDeal.image_src}
                                    alt="Deal Image"
                                    className="w-full h-48 object-cover mb-2 rounded-md"
                                />
                            )}
                            <div>
                                <Label>Bud Name</Label>
                                <Input
                                    value={editBudName}
                                    onChange={(e) => setEditBudName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label>1g Price</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editOneGramPrice}
                                        onChange={(e) => setEditOneGramPrice(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label>4g Price</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editFourGramPrice}
                                        onChange={(e) => setEditFourGramPrice(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>BG Gradient</Label>
                                <Input
                                    placeholder="e.g. from-green-500 to-blue-500"
                                    value={editBgGradient}
                                    onChange={(e) => setEditBgGradient(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Replace Image (optional)</Label>
                                <Input type="file" onChange={(e) => setEditFile(e.target.files?.[0] || null)} />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="submit">Save Changes</Button>
                                <Button variant="outline" onClick={() => setIsEditSheetOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </SheetContent>
            </Sheet>

            {/* DELETE CONFIRM DIALOG */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                    </DialogHeader>
                    <p className="mt-2">
                        Are you sure you want to delete{" "}
                        <strong>{selectedDeal?.bud_name ?? "this deal"}</strong>?
                    </p>
                    <DialogFooter>
                        <Button variant="destructive" onClick={confirmDeleteDeal}>
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