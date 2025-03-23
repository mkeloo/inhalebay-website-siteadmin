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
    updateSortOrder,
    updateFlowerBudDealEnabled,
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
import { ArrowUpDown, GripVertical } from "lucide-react";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function HempFlowerDealsPage() {
    const [data, setData] = useState<FlowerBudDeal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isSortMode, setIsSortMode] = useState(false);

    // Pagination state
    // const pageSize = 10; // Number of rows per page
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });


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
            pagination, // pass the pagination state here
        },
        onPaginationChange: setPagination, // update the pagination state when it changes
        initialState: {
            sorting: [{ id: "sort", desc: false }],
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

    async function handleToggleEnabled(id: number, enabled: boolean) {
        setData(prevData => prevData.map(deal =>
            deal.id === id ? { ...deal, is_enabled: enabled } : deal
        ));

        const res = await updateFlowerBudDealEnabled(id, enabled);
        if (!res.success) {
            alert("Failed to update status: " + res.error);

            setData(prevData => prevData.map(deal =>
                deal.id === id ? { ...deal, is_enabled: !enabled } : deal
            ));
            return;
        }

        const dealsRes = await fetchFlowerBudDeals();
        if (dealsRes.success) {
            setData(dealsRes.data);
        }
    }

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        // Reorder the local array
        const oldIndex = data.findIndex(item => item.id === active.id);
        const newIndex = data.findIndex(item => item.id === over.id);
        const reordered = arrayMove(data, oldIndex, newIndex);

        // Assign new sort values in ascending order (starting at 1)
        reordered.forEach((deal, idx) => {
            deal.sort = idx + 1;
        });
        setData(reordered);

        // Update sort order in Supabase by passing an array of { id, sort } objects
        try {
            await updateSortOrder(reordered.map(deal => ({ id: deal.id, sort: deal.sort ?? 0 })));
        } catch (err) {
            console.error("Failed to update sort order", err);
        }
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto">
            {/* Header */}
            <Card className="w-full flex flex-row items-center justify-between gap-4 px-6 py-4 mb-4">
                <h1 className="text-2xl font-semibold">Flower Bud Deals</h1>
                <div className="flex gap-4">
                    {/* Page Size Dropdown */}
                    <Select
                        value={String(pagination.pageSize)}
                        onValueChange={(val) => {
                            const newPageSize = Number(val);
                            setPagination({ pageIndex: 0, pageSize: newPageSize });
                        }}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Page size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="30">30</SelectItem>
                            <SelectItem value="40">40</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setIsSortMode(!isSortMode)}>Sort Order</Button>
                    <Button onClick={openCreateDialog}>Create Deal</Button>
                </div>
            </Card>

            {/* Table */}
            <div className="w-full overflow-x-auto rounded-md border h-[600px]">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                        items={data.map((deal) => deal.id)}
                        strategy={verticalListSortingStrategy}
                    >

                        <div className="w-full h-[600px] overflow-y-auto block">
                            <Table className="table-auto w-full">
                                <TableHeader className="sticky top-0 z-10">
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
                                            // Use your custom SortableRow instead of a plain TableRow
                                            <SortableRow key={row.id} row={row} isSortMode={isSortMode} onToggleEnabled={handleToggleEnabled} />
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


                    </SortableContext>
                </DndContext>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <Button
                    variant="outline"
                    disabled={pagination.pageIndex === 0}
                    onClick={() => table.setPageIndex(pagination.pageIndex - 1)}
                >
                    Previous
                </Button>
                <span className="text-lg font-medium">
                    Page {pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <Button
                    variant="outline"
                    disabled={pagination.pageIndex + 1 >= table.getPageCount()}
                    onClick={() => table.setPageIndex(pagination.pageIndex + 1)}
                >
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


function SortableRow({
    row,
    isSortMode,
    onToggleEnabled,
}: {
    row: ReturnType<
        ReturnType<typeof useReactTable>["getRowModel"]
    >["rows"][number];
    isSortMode: boolean;
    onToggleEnabled: (id: number, enabled: boolean) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: (row.original as FlowerBudDeal).id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <TableRow ref={setNodeRef} style={style} {...attributes}>
            {row.getVisibleCells().map((cell) => {
                const cellId = cell.column.id;

                if (cellId === "id") {
                    return (
                        <TableCell key={cell.id}>
                            {isSortMode ? (
                                <div
                                    className="cursor-grab text-gray-600 flex items-center justify-center"
                                    {...listeners}
                                >
                                    <GripVertical className="w-6 h-6 ml-1" />
                                </div>
                            ) : (
                                flexRender(cell.column.columnDef.cell, cell.getContext())
                            )}
                        </TableCell>
                    );
                }

                // Handle your toggle explicitly here
                if (cellId === "is_enabled") {
                    const enabled = row.getValue<boolean>("is_enabled");
                    const id = row.getValue<number>("id");
                    return (
                        <TableCell key={cell.id} className="text-center">
                            <Switch
                                checked={enabled}
                                onCheckedChange={(checked) => onToggleEnabled(id, checked)}
                            />
                        </TableCell>
                    );
                }

                // Otherwise, render the cell normally
                return (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                );
            })}
        </TableRow>
    );
}