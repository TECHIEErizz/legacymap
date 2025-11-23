"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, SearchIcon } from "lucide-react"
import MetricsCard from "@/components/metrics-card"
import DetailsModal from "@/components/details-modal"

interface DashboardProps {
    data: any
    onBack: () => void
}

export default function Dashboard({ data, onBack }: DashboardProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFunction, setSelectedFunction] = useState<any>(null)
    const [modalType, setModalType] = useState<"calls" | "dependencies" | null>(null)

    const filteredFunctions = useMemo(() => {
        return data.functions.filter(
            (fn: any) =>
                fn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                fn.file.toLowerCase().includes(searchQuery.toLowerCase()),
        )
    }, [data.functions, searchQuery])

    const handleViewCalls = (fn: any) => {
        setSelectedFunction(fn)
        setModalType("calls")
    }

    const handleViewDependencies = (fn: any) => {
        setSelectedFunction(fn)
        setModalType("dependencies")
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{data.fileName}</h1>
                            <p className="text-sm text-muted-foreground">Analysis Results</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Metrics */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <MetricsCard label="Total Files" value={data.totalFiles} />
                    <MetricsCard label="Lines of Code" value={data.totalLOC.toLocaleString()} />
                    <MetricsCard label="Functions/Classes" value={data.functions.length} />
                </div>

                {/* Search and Filter */}
                <div className="mb-8">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Search functions, files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                {/* Functions Table */}
                <div className="rounded-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-card border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">File</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Line</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFunctions.map((fn: any, idx: number) => (
                                    <tr
                                        key={fn.id}
                                        className={`border-b border-border hover:bg-secondary/50 transition ${idx % 2 === 0 ? "bg-background" : "bg-card/50"
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <span className="font-medium text-accent">{fn.name}</span>
                                                {fn.parentClass && (
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        (in {fn.parentClass})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{fn.file}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium px-2 py-1 rounded bg-secondary text-secondary-foreground">
                                                {fn.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">{fn.lineStart}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewCalls(fn)}
                                                    className="border-border hover:bg-secondary text-foreground text-xs"
                                                >
                                                    View Calls
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewDependencies(fn)}
                                                    className="border-border hover:bg-secondary text-foreground text-xs"
                                                >
                                                    Dependencies
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredFunctions.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No functions found matching your search.</p>
                    </div>
                )}
            </main>

            {/* Modal */}
            {selectedFunction && modalType && (
                <DetailsModal
                    function={selectedFunction}
                    type={modalType}
                    repoId={data.repoId}
                    onClose={() => {
                        setSelectedFunction(null)
                        setModalType(null)
                    }}
                />
            )}
        </div>
    )
}
