"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { uploadStoreImage } from "@/app/actions/uploadStoreImages";
import { updateStoreImage, updateSortOrder, deleteStoreImage, uploadStoreImagesBulk } from "@/app/actions/websiteStoreImages";
import { GripVertical, Hand, X } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BulkUploader } from "@/components/siteadmin/MediaBrowser/BulkUploader";

type Image = {
    id: number;
    image_src: string;
    image_alt: string;
    sort: number;
    created_at?: string;
    updated_at?: string;
};

type Props = { images: Image[] };

export default function StoreGalleryClient({ images }: Props) {
    const router = useRouter();
    const [imageList, setImageList] = useState(images);
    const [isPending, startTransition] = useTransition();
    const [selectedImage, setSelectedImage] = useState<Image | null>(null);
    const [newAlt, setNewAlt] = useState("");
    const [newFile, setNewFile] = useState<File | null>(null);
    const [newSort, setNewSort] = useState<number>();
    const [mounted, setMounted] = useState(false);


    // For single upload
    const [isUploading, setIsUploading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // For bulk upload
    const bulkFormRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        setIsUploading(true);
        startTransition(async () => {
            try {
                await uploadStoreImage(formData);
                toast.success("Uploaded successfully");
                router.refresh();

                // ✅ Reset form after successful upload
                formRef.current?.reset();
            } catch (err: any) {
                toast.error(`Upload failed: ${err.message}`);
            } finally {
                setIsUploading(false);
            }
        });
    }

    // New bulk-upload logic (placeholder example)
    async function handleBulkSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const files = formData.getAll("files") as File[];

        // Limit to 10 images
        if (files.length === 0) {
            toast.error("No files selected.");
            return;
        }
        if (files.length > 10) {
            toast.error("You can only upload up to 10 files at once.");
            return;
        }

        setIsUploading(true);
        startTransition(async () => {
            try {
                // This function must be implemented similarly to `uploadStoreImage`.
                // For each file, you can set alt text = file.name on the server side.
                await uploadStoreImagesBulk(formData);

                toast.success("Bulk uploaded successfully!");
                router.refresh();

                // Reset the bulk form
                bulkFormRef.current?.reset();
            } catch (err: any) {
                toast.error(`Bulk upload failed: ${err.message}`);
            } finally {
                setIsUploading(false);
            }
        });
    }


    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = imageList.findIndex(i => i.id === active.id);
            const newIndex = imageList.findIndex(i => i.id === over.id);
            const updatedImages = arrayMove(imageList, oldIndex, newIndex);

            // Update sort orders after dragging
            updatedImages.forEach((img, idx) => img.sort = idx + 1);
            setImageList(updatedImages);

            updateSortOrder(updatedImages.map(({ id, sort }) => ({ id, sort })))
                .then(() => toast.success("Sort order updated!"))
                .catch(err => toast.error(`Failed to update sort: ${err.message}`));
        }
    };

    const handleUpdate = () => {
        if (!selectedImage) return;
        startTransition(async () => {
            try {
                await updateStoreImage(selectedImage.id, newAlt, newSort, newFile);
                toast.success("Image updated successfully!");
                router.refresh();
            } catch (err: any) {
                toast.error(`Failed to update image: ${err.message}`);
            }
        });
    };

    // Delete function
    const handleDelete = (id: number) => {
        startTransition(async () => {
            try {
                const imagePath = imageList.find(img => img.id === id)?.image_src || "";
                await deleteStoreImage(id, imagePath); // server action
                setImageList((prev) => prev.filter((img) => img.id !== id)); // remove from local state
                toast.success("Image deleted successfully!");
                router.refresh();
                console.log("Deleted image with ID:", id);
            } catch (err: any) {
                toast.error(`Failed to delete image: ${err.message}`);
            }
        });
    };


    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Media Library</h1>
                {/* Dialog with Tabs for Single / Bulk upload */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Upload Image</Button>
                    </DialogTrigger>

                    <VisuallyHidden.Root>
                        <DialogTitle>Upload Image</DialogTitle>
                        <DialogDescription>Upload Image Dialog box</DialogDescription>
                    </VisuallyHidden.Root>

                    <DialogContent>
                        <Tabs defaultValue="single" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="single">Single Upload</TabsTrigger>
                                <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                            </TabsList>

                            {/* SINGLE UPLOAD TAB */}
                            <TabsContent value="single">
                                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="file">Select Image</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            name="file"
                                            required
                                            disabled={isUploading}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="imageAlt">Alt Text</Label>
                                        <Input
                                            id="imageAlt"
                                            type="text"
                                            name="imageAlt"
                                            required
                                            disabled={isUploading}
                                        />
                                    </div>
                                    <Button type="submit" disabled={isUploading}>
                                        {isUploading ? "Uploading..." : "Upload"}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* BULK UPLOAD TAB */}
                            <TabsContent value="bulk">
                                <BulkUploader onSubmit={uploadStoreImagesBulk} maxFiles={10} />
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            </div>

            {mounted && (
                <Card className="w-full h-full px-6 py-10 mt-4">
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={imageList.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            <div className="grid grid-cols-4 gap-4">
                                {imageList.map(img => (
                                    <SortableImage key={img.id} img={img} onSelect={setSelectedImage} onDelete={handleDelete} // pass down
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </Card>
            )}

            <Sheet open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Edit Image</SheetTitle>
                    </SheetHeader>
                    {selectedImage && (
                        <div className="space-y-4 px-4">
                            <img
                                src={`https://dnltndrwudjaskjwczvm.supabase.co/storage/v1/object/public/inhale-bay-website${selectedImage.image_src}`}
                                alt={selectedImage.image_alt}
                                className="w-full h-48 object-cover rounded-md"
                            />
                            <div>
                                <strong>Filename:</strong> {selectedImage.image_src.split("/").pop()}
                            </div>
                            <div>
                                <strong>Alt Text:</strong> {selectedImage.image_alt}
                            </div>
                            <div>
                                <strong>Sort Order:</strong> {selectedImage.sort}
                            </div>
                            <div>
                                <strong>Image URL:</strong>
                                <a
                                    href={`https://dnltndrwudjaskjwczvm.supabase.co/storage/v1/object/public/inhale-bay-website${selectedImage.image_src}`}
                                    target="_blank"
                                    className="text-blue-500 underline block truncate"
                                >
                                    Open Image
                                </a>
                            </div>
                            <form
                                className="space-y-4"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleUpdate();
                                }}
                            >
                                <Label>Update Alt Text</Label>
                                <Input
                                    defaultValue={selectedImage.image_alt}
                                    onChange={(e) => setNewAlt(e.target.value)}
                                />

                                <Label>Update Sort Order</Label>
                                <Input
                                    type="number"
                                    defaultValue={selectedImage.sort}
                                    onChange={(e) => setNewSort(Number(e.target.value))}
                                />

                                <Label>Replace Image</Label>
                                <Input
                                    type="file"
                                    onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                                />

                                <Button type="submit">Save Changes</Button>
                            </form>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

function SortableImage({
    img,
    onSelect,
    onDelete,
}: {
    img: Image;
    onSelect: (img: Image) => void;
    onDelete: (id: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: img.id });

    // Local state for confirmation dialog
    const [openConfirm, setOpenConfirm] = useState(false);

    // Only increase z-index while dragging
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 9999 : "auto",
    };

    return (
        <Card ref={setNodeRef} style={style} {...attributes} className="relative mx-2 !gap-0">
            {/* Confirm Delete Dialog */}
            <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
                <DialogContent className="p-4">
                    <DialogTitle className="text-lg font-bold">
                        Confirm Delete
                    </DialogTitle>
                    <p className="mt-2 text-sm">
                        Are you sure you want to delete this image?
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(img.id);
                                setOpenConfirm(false);
                            }}
                        >
                            Delete
                        </Button>
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenConfirm(false);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>


            {/* Red X in top-right for Delete */}
            <button
                className="absolute -top-4 -right-2 p-2 bg-red-500 text-white rounded-full active:scale-90 hover:bg-red-400 transition-colors duration-150"
                onClick={(e) => {
                    e.stopPropagation(); // prevent drag events
                    setOpenConfirm(true);
                }}
            >
                <X size={16} />
            </button>

            {/* Dedicated drag handle */}
            <div {...listeners} className="absolute -top-4 -left-2 p-2 rounded-xl cursor-move text-xs text-white bg-gray-500/65 active:scale-90 hover:bg-gray-400 transition-colors duration-150">
                <GripVertical size={20} />
            </div>

            {/* Image Preview */}
            <Dialog>
                <DialogTrigger asChild>
                    <img
                        src={`https://dnltndrwudjaskjwczvm.supabase.co/storage/v1/object/public/inhale-bay-website${img.image_src}`}
                        alt={img.image_alt}
                        className="h-40 w-full object-cover cursor-pointer"
                    />
                </DialogTrigger>
                <VisuallyHidden.Root>
                    <DialogTitle>{img.image_alt}</DialogTitle>
                </VisuallyHidden.Root>
                <DialogContent className="p-0">
                    <img
                        src={`https://dnltndrwudjaskjwczvm.supabase.co/storage/v1/object/public/inhale-bay-website${img.image_src}`}
                        alt={img.image_alt}
                        className="w-full h-auto"
                    />
                </DialogContent>
            </Dialog>

            {/* Info Section */}
            <div className="w-full flex flex-wrap items-center justify-between py-2 px-2 bg-neutral-800 rounded-b-xl text-white text-xs">
                <p className="truncate w-1/2"><span className="font-semibold">Alt:</span> {img.image_alt}</p>
                <p className="w-1/4 text-right"><span className="font-semibold">ID:</span> {img.id}</p>
                <p className="w-1/4 text-right"><span className="font-semibold">Sort:</span> {img.sort}</p>

                {img.created_at && (
                    <p className="w-1/2 truncate"><span className="font-semibold">Created:</span> {new Date(img.created_at).toLocaleDateString()}</p>
                )}
                {img.updated_at && (
                    <p className="w-1/2 text-right"><span className="font-semibold">Updated:</span> {new Date(img.updated_at).toLocaleDateString()}</p>
                )}

                <div className="w-full flex items-center justify-center mt-1">
                    <Button
                        size="sm"
                        className="px-3 py-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(img);
                        }}
                    >
                        Edit
                    </Button>
                </div>
            </div>
        </Card>
    );
}
