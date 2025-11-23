"use client"

import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DetailsModalProps {
    function: any
    type: "calls" | "dependencies"
    onClose: () => void
    repoId: string
}

export default function DetailsModal({ function: fn, type, onClose, repoId }: DetailsModalProps) {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true)
            setError(null)

            try {
                const url = `${API_BASE}/function-details/${repoId}?file_path=${encodeURIComponent(fn.file)}&function_name=${encodeURIComponent(fn.name)}`

                const response = await fetch(url)

                if (!response.ok) {
                    throw new Error(`Failed to fetch details: ${response.statusText}`)
                }

                const result = await response.json()
                setData(result)
            } catch (err) {
                console.error('Error fetching function details:', err)
                setError(err instanceof Error ? err.message : 'Failed to load details')
            } finally {
                setLoading(false)
            }
        }

        fetchDetails()
    }, [fn, repoId])

    const title = type === "calls" ? "Where Function is Called" : "Function Dependencies"
    const tableData = type === "calls" ? data?.call_sites_table : data?.dependencies_table

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
                <div className="w-full max-w-3xl bg-card border border-border rounded-lg shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <div>
                            <h2 className="text-lg font-semibold">{title}</h2>
                            <p className="text-sm text-muted-foreground">
                                {fn.name} <span className="text-xs">({fn.file})</span>
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-96 overflow-y-auto">
                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                                <span className="ml-3 text-muted-foreground">Loading details...</span>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
                                <p className="font-semibold">Error:</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {!loading && !error && tableData && (
                            <div>
                                <h3 className="text-sm font-semibold mb-4">{tableData.title}</h3>
                                {tableData.rows.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No {type} found.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {tableData.rows.map((row: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="p-4 rounded-lg bg-secondary/50 border border-border"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="text-sm font-medium text-accent">
                                                        {type === "calls" ? row.file : row.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Line {row.line}
                                                    </span>
                                                </div>
                                                <code className="text-xs font-mono block p-2 bg-background rounded border border-border overflow-x-auto">
                                                    {row.code}
                                                </code>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-4">
                                    Total: {tableData.count} {type}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-border flex justify-end">
                        <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
