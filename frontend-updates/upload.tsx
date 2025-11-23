"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UploadIcon, Loader2 } from "lucide-react"

interface UploadProps {
    onUpload: (data: any) => void
}

export default function Upload({ onUpload }: UploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    const handleFileUpload = async (file: File) => {
        if (!file.name.endsWith('.zip')) {
            setError('Please upload a ZIP file')
            return
        }

        setIsUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch(`${API_BASE}/upload-analyze`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`)
            }

            const data = await response.json()

            // Transform backend data to match frontend expectations
            const transformedData = {
                fileName: file.name,
                repoId: data.repo_id,
                totalFiles: data.total_files,
                totalLOC: data.total_loc,
                functions: transformFunctionsData(data),
                classes: countClasses(data),
                rawData: data, // Keep original data for reference
            }

            onUpload(transformedData)
        } catch (err) {
            console.error('Upload error:', err)
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    const transformFunctionsData = (data: any) => {
        const functions: any[] = []
        let id = 1

        // Extract all functions and classes from nodes
        Object.entries(data.nodes || {}).forEach(([filePath, nodeData]: [string, any]) => {
            (nodeData.functions_classes || []).forEach((func: any) => {
                functions.push({
                    id: id++,
                    name: func.name,
                    type: func.type,
                    file: filePath,
                    lines: nodeData.loc || 0,
                    lineStart: func.line_start,
                    parentClass: func.parent_class,
                    language: func.language,
                    calls: [], // Will be populated when user clicks for details
                    dependencies: [], // Will be populated when user clicks for details
                })
            })
        })

        return functions
    }

    const countClasses = (data: any) => {
        let count = 0
        Object.values(data.nodes || {}).forEach((nodeData: any) => {
            (nodeData.functions_classes || []).forEach((func: any) => {
                if (func.type === 'class') count++
            })
        })
        return count
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileUpload(file)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            handleFileUpload(file)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-2xl">
                <h1 className="text-4xl font-bold mb-2">Upload Your Codebase</h1>
                <p className="text-muted-foreground mb-12">Upload a ZIP file of your legacy codebase for analysis</p>

                {/* Upload Area */}
                <div
                    className={`relative border-2 border-dashed rounded-lg p-12 text-center transition ${isDragging ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                        }`}
                    onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-12 h-12 text-accent mx-auto mb-4 animate-spin" />
                            <h2 className="text-xl font-semibold mb-2">Analyzing your code...</h2>
                            <p className="text-muted-foreground">This may take a few moments</p>
                        </>
                    ) : (
                        <>
                            <UploadIcon className="w-12 h-12 text-accent mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Drop ZIP file here</h2>
                            <p className="text-muted-foreground mb-6">or click the button below</p>

                            <input
                                type="file"
                                accept=".zip"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload"
                                disabled={isUploading}
                            />
                            <label htmlFor="file-upload">
                                <Button
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    disabled={isUploading}
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    Browse Files
                                </Button>
                            </label>
                        </>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
                        <p className="font-semibold">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Info */}
                <div className="mt-12 p-6 rounded-lg bg-card border border-border">
                    <h3 className="font-semibold mb-4">Supported formats</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>✅ ZIP files containing your codebase</li>
                        <li>✅ JavaScript (.js, .jsx)</li>
                        <li>✅ TypeScript (.ts, .tsx)</li>
                        <li>✅ Python (.py)</li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            <strong>Backend URL:</strong> {API_BASE}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
