import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// Minimal type to store both File + alt text
type FileItem = {
    file: File
    alt: string
}

export function BulkUploader({
    onSubmit,
    maxFiles = 10,
}: {
    onSubmit: (formData: FormData) => Promise<void>
    maxFiles?: number
}) {
    const [fileList, setFileList] = useState<FileItem[]>([])
    const [isUploading, setIsUploading] = useState(false)

    // Handle file selection
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return

        const selected = Array.from(e.target.files).map((file) => ({
            file,
            alt: file.name, // default alt is file name
        }))

        // Append new files to the queue
        setFileList((prev) => [...prev, ...selected])
        // Reset input so user can select the same file again if needed
        e.target.value = ""
    }

    // Remove a file from the queue
    function handleRemove(idx: number) {
        setFileList((prev) => prev.filter((_, i) => i !== idx))
    }

    // Update the alt text
    function handleAltChange(idx: number, newAlt: string) {
        setFileList((prev) => {
            const copy = [...prev]
            copy[idx] = { ...copy[idx], alt: newAlt }
            return copy
        })
    }

    // Final submit
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (fileList.length === 0) {
            toast.error("No files selected.")
            return
        }
        if (fileList.length > maxFiles) {
            toast.error(`You can only upload up to ${maxFiles} files at once.`)
            return
        }

        setIsUploading(true)
        try {
            // Build form data manually
            const formData = new FormData()
            fileList.forEach((item, i) => {
                formData.append("files", item.file)
                formData.append(`alt-${i}`, item.alt)
            })

            // Fire the parent-provided onSubmit (which calls your server action)
            await onSubmit(formData)

            // Clear out the queue
            setFileList([])
            toast.success("Bulk uploaded successfully!")
        } catch (err: any) {
            toast.error(`Bulk upload failed: ${err.message}`)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Label>Select up to {maxFiles} images</Label>
            <Input
                type="file"
                multiple
                disabled={isUploading}
                onChange={handleFileChange}
            />

            {/* Display the queue of selected files */}
            <div className="mt-2 space-y-2 h-[40vh] overflow-y-scroll">
                {fileList.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between border p-2 rounded"
                    >
                        <div className="flex flex-col">
                            <Input
                                className="w-48"
                                value={item.alt}
                                onChange={(e) => handleAltChange(idx, e.target.value)}
                            />
                            <span className="text-xs text-gray-500">
                                {item.file.name} ({Math.round(item.file.size / 1024)} KB)
                            </span>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemove(idx)}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
            </div>

            <Button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Bulk Upload"}
            </Button>
        </form>
    )
}