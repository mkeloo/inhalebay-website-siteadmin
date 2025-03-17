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

import { createVapeDealColumns } from "./columns";
import {
    fetchVapeDeals,
    fetchVapeDealById,
    createVapeDealWithFile,
    updateVapeDealWithFile,
    deleteVapeDeal,
    fetchMediaBucketUrl,
    VapeDeal,
} from "../../../actions/vapesDeals";

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

export default function VapesDealsPage() {
    const [data, setData] = useState<VapeDeal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Table states
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    // For dialogs and sheet
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Media base URL (e.g. "https://dnltndrwudjaskjwczvm.supabase.co/storage/v1/object/public/inhale-bay-website")
    const [mediaBaseUrl, setMediaBaseUrl] = useState<string>("");

    // Selected deal for editing/deleting
    const [selectedDeal, setSelectedDeal] = useState<VapeDeal | null>(null);

    // States for creating a new deal
    const [newCompany, setNewCompany] = useState("");
    const [newBuy1, setNewBuy1] = useState("");
    const [newBuy2, setNewBuy2] = useState("");
    const [newDiscount, setNewDiscount] = useState("");
    const [newTagline, setNewTagline] = useState("");
    const [newShortTitle, setNewShortTitle] = useState("");
    const [newBgGradient, setNewBgGradient] = useState("");
    const [newFile, setNewFile] = useState<File | null>(null);

    // States for updating an existing deal (used in the sheet)
    const [editCompany, setEditCompany] = useState("");
    const [editBuy1, setEditBuy1] = useState("");
    const [editBuy2, setEditBuy2] = useState("");
    const [editDiscount, setEditDiscount] = useState("");
    const [editTagline, setEditTagline] = useState("");
    const [editShortTitle, setEditShortTitle] = useState("");
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
            const res = await fetchVapeDeals();
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
            createVapeDealColumns({
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
        setNewCompany("");
        setNewBuy1("");
        setNewBuy2("");
        setNewDiscount("");
        setNewTagline("");
        setNewShortTitle("");
        setNewBgGradient("");
        setNewFile(null);
        setIsCreateDialogOpen(true);
    }

    async function handleCreateDeal(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("vape_company", newCompany);
        formData.append("buy_1_price", newBuy1 || "0");
        formData.append("buy_2_price", newBuy2 || "0");
        formData.append("discount_percent", newDiscount || "0");
        formData.append("deal_tagline", newTagline);
        formData.append("short_title", newShortTitle);
        formData.append("bg_gradient", newBgGradient);
        if (newFile) formData.append("file", newFile);

        const res = await createVapeDealWithFile(formData);
        if (res.success) {
            const dealsRes = await fetchVapeDeals();
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
        const res = await fetchVapeDealById(dealId);
        if (res.success && res.data) {
            setSelectedDeal(res.data);
            setEditCompany(res.data.vape_company);
            setEditBuy1(String(res.data.buy_1_price));
            setEditBuy2(String(res.data.buy_2_price));
            setEditDiscount(String(res.data.discount_percent));
            setEditTagline(res.data.deal_tagline);
            setEditShortTitle(res.data.short_title);
            setEditBgGradient(res.data.bg_gradient);
            setEditFile(null);
            setIsEditSheetOpen(true);
        }
    }

    async function handleUpdateDeal(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!selectedDeal) return;
        const formData = new FormData();
        formData.append("vape_company", editCompany);
        formData.append("buy_1_price", editBuy1 || "0");
        formData.append("buy_2_price", editBuy2 || "0");
        formData.append("discount_percent", editDiscount || "0");
        formData.append("deal_tagline", editTagline);
        formData.append("short_title", editShortTitle);
        formData.append("bg_gradient", editBgGradient);
        if (editFile) formData.append("file", editFile);

        const res = await updateVapeDealWithFile(selectedDeal.id, formData);
        if (res.success) {
            const dealsRes = await fetchVapeDeals();
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
        const res = await deleteVapeDeal(selectedDeal.id);
        if (res.success) {
            const dealsRes = await fetchVapeDeals();
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
                <h1 className="text-2xl font-semibold">Vape Deals</h1>
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
                            <Label htmlFor="newCompany">Vape Company</Label>
                            <Input
                                id="newCompany"
                                value={newCompany}
                                onChange={(e) => setNewCompany(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>Buy 1 Price</Label>
                                <Input
                                    type="number"
                                    value={newBuy1}
                                    onChange={(e) => setNewBuy1(e.target.value)}
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <Label>Buy 2 Price</Label>
                                <Input
                                    type="number"
                                    value={newBuy2}
                                    onChange={(e) => setNewBuy2(e.target.value)}
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Discount %</Label>
                            <Input
                                type="number"
                                value={newDiscount}
                                onChange={(e) => setNewDiscount(e.target.value)}
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <Label>Deal Tagline</Label>
                            <Input
                                value={newTagline}
                                onChange={(e) => setNewTagline(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label>Short Title</Label>
                            <Input
                                value={newShortTitle}
                                onChange={(e) => setNewShortTitle(e.target.value)}
                                required
                            />
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
                                <Label>Vape Company</Label>
                                <Input
                                    value={editCompany}
                                    onChange={(e) => setEditCompany(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label>Buy 1 Price</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editBuy1}
                                        onChange={(e) => setEditBuy1(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label>Buy 2 Price</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editBuy2}
                                        onChange={(e) => setEditBuy2(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Discount %</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editDiscount}
                                    onChange={(e) => setEditDiscount(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Deal Tagline</Label>
                                <Input
                                    value={editTagline}
                                    onChange={(e) => setEditTagline(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Short Title</Label>
                                <Input
                                    value={editShortTitle}
                                    onChange={(e) => setEditShortTitle(e.target.value)}
                                    required
                                />
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
                        <strong>{selectedDeal?.vape_company ?? "this deal"}</strong>?
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