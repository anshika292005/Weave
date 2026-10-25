"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    FolderOpen,
    FileText,
    Layers,
    ArrowRight,
    Plus,
    GitBranch,
    BookOpen,
    Database,
    Search,
    Sparkles,
    CheckCircle2,
    Cpu,
    Activity,
    ExternalLink
} from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Navbar } from "@/components/layout/Navbar"
import { SlideToAnalyze } from "@/components/home/SlideToAnalyze"
import { projectsApi, analyzerApi } from "@/lib/api"
import { useConfigStore } from "@/stores/useConfigStore"
import { useToast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"

const AnalysisResultOverlay = dynamic(
    () => import("@/components/analysis/AnalysisResultOverlay").then(mod => ({ default: mod.AnalysisResultOverlay })),
    { ssr: false }
)

interface Project {
    id: string
    name: string
    description: string | null
    total_files: number
    total_chunks: number
    dominant_doc_type: string | null
    status: string
    created_at: string
    updated_at: string | null
}

const TOOLKIT = [
    {
        href: "/projects",
        icon: Database,
        tag: "PROJECTS",
        title: "Knowledge Bases",
        body: "Manage document collections, run chunk visualizations, and compare indexing runs.",
        actionText: "Open Projects"
    },
    {
        href: "/pipeline",
        icon: GitBranch,
        tag: "PIPELINE_DAG",
        title: "Pipeline Builder",
        body: "Wire up chunking, retrieval and reranking nodes visually, then execute with live queries.",
        actionText: "Launch Builder"
    },
    {
        href: "/guide",
        icon: BookOpen,
        tag: "KNOWLEDGE_BASE",
        title: "Strategy Guide",
        body: "Explore 39+ chunking and retrieval strategies, cost estimations, and optimal pairings.",
        actionText: "Read Guide"
    },
    {
        href: "/analyze",
        icon: Search,
        tag: "FORENSIC_SCAN",
        title: "Corpus Analyzer",
        body: "Inspect token density, regex signals, and semantic boundaries on individual documents.",
        actionText: "Analyze File"
    },
]

const STATS = [
    { value: "8", label: "Chunking strategies" },
    { value: "17+", label: "Retrieval strategies" },
    { value: "13", label: "Rerankers" },
    { value: "8", label: "Embedding models" },
]

function formatNumber(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return n.toLocaleString()
}

function relativeTime(dateStr: string): string {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return "just now"
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay === 1) return "yesterday"
    if (diffDay < 30) return `${diffDay}d ago`
    return date.toLocaleDateString()
}

export default function DashboardPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<any>(null)
    const setSelectedDocId = useConfigStore((state) => state.setSelectedDocId)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await projectsApi.list()
                setProjects(data.projects || [])
            } catch (error) {
                console.error("Failed to fetch projects:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleDirectAnalyze = async (file: File) => {
        setIsAnalyzing(true)
        try {
            const result = await analyzerApi.analyzeDocument(file)
            setAnalysisResult(result)
            setSelectedDocId(result.document_id)
        } catch (error) {
            console.error("Analysis failed:", error)
            toast({
                title: "Scan Failed",
                description: "Deep content inspection failed for this document.",
                variant: "destructive"
            })
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleConfirmAnalysis = (config: any) => {
        if (!analysisResult) return
        const method = config.chunking_method === 'character' ? 'recursive' : config.chunking_method as any

        useConfigStore.getState().setMethod(method)
        useConfigStore.getState().setChunkSize(config.chunk_size)
        useConfigStore.getState().setOverlap(config.overlap)
        if (config.threshold) {
            useConfigStore.getState().setThreshold(config.threshold)
        }

        router.push(`/visualizer?docId=${analysisResult.document_id}&auto=true`)
        setAnalysisResult(null)
    }

    const totalProjects = projects.length
    const totalFiles = projects.reduce((acc, p) => acc + (p.total_files || 0), 0)
    const totalChunks = projects.reduce((acc, p) => acc + (p.total_chunks || 0), 0)
    const recentProjects = projects
        .filter((p) => p.status === "active")
        .slice(0, 5)

    return (
        <div className="relative min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
            {/* Top Navigation */}
            <Navbar />

            {/* Subtle Hero Radial Gradient like Landing Page */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-16 h-[500px] bg-[radial-gradient(60%_60%_at_70%_0%,theme(colors.blue.50),transparent)]"
            />

            <main className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-12">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-2 border-b border-slate-100">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/80 text-[11px] font-semibold text-blue-600 tracking-wide uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            Workspace Overview
                        </div>
                        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-slate-900">
                            Dashboard
                        </h1>
                        <p className="mt-1.5 text-sm md:text-base text-slate-500 max-w-xl leading-relaxed">
                            Monitor knowledge base ingestion, chunk metrics, and orchestrate RAG pipelines.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/projects"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all group"
                        >
                            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                            <span>New Project</span>
                        </Link>
                    </div>
                </div>

                {/* Metrics Cards - Styled with ConnectedPageCards stacked paper effect */}
                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Projects Card */}
                        <div className="relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] hover:border-blue-300 hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.14)] transition-all group">
                            <div 
                                aria-hidden="true"
                                className="absolute -bottom-1.5 inset-x-3 h-2 rounded-b-xl bg-slate-100 border border-slate-200/70 -z-10 shadow-2xs group-hover:bg-blue-50/50 transition-colors"
                            />
                            <div>
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <FolderOpen className="w-4 h-4" />
                                        </div>
                                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">
                                            KNOWLEDGE_BASES
                                        </span>
                                    </div>
                                    <span className="font-mono text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                        01
                                    </span>
                                </div>
                                <div className="mt-2 text-3xl font-mono font-semibold tracking-tight text-slate-900">
                                    {isLoading ? <LoadingSpinner size="sm" /> : totalProjects}
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Active projects in workspace</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                                    <span className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                                        <Activity className="w-3.5 h-3.5 text-blue-600" />
                                        Index Status
                                    </span>
                                    <span className="text-blue-600 font-bold text-[10px] bg-blue-50 px-1.5 py-0.5 rounded">
                                        Synchronized
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Total Files Card */}
                        <div className="relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] hover:border-blue-300 hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.14)] transition-all group">
                            <div 
                                aria-hidden="true"
                                className="absolute -bottom-1.5 inset-x-3 h-2 rounded-b-xl bg-slate-100 border border-slate-200/70 -z-10 shadow-2xs group-hover:bg-blue-50/50 transition-colors"
                            />
                            <div>
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">
                                            DOC_SOURCES
                                        </span>
                                    </div>
                                    <span className="font-mono text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                        02
                                    </span>
                                </div>
                                <div className="mt-2 text-3xl font-mono font-semibold tracking-tight text-slate-900">
                                    {isLoading ? <LoadingSpinner size="sm" /> : formatNumber(totalFiles)}
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Total documents uploaded</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                                    <span className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        Extraction
                                    </span>
                                    <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">
                                        On-Demand
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Total Chunks Card */}
                        <div className="relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] hover:border-blue-300 hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.14)] transition-all group">
                            <div 
                                aria-hidden="true"
                                className="absolute -bottom-1.5 inset-x-3 h-2 rounded-b-xl bg-slate-100 border border-slate-200/70 -z-10 shadow-2xs group-hover:bg-blue-50/50 transition-colors"
                            />
                            <div>
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Layers className="w-4 h-4" />
                                        </div>
                                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">
                                            VECTOR_CHUNKS
                                        </span>
                                    </div>
                                    <span className="font-mono text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                        03
                                    </span>
                                </div>
                                <div className="mt-2 text-3xl font-mono font-semibold tracking-tight text-slate-900">
                                    {isLoading ? <LoadingSpinner size="sm" /> : formatNumber(totalChunks)}
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Semantic chunk partitions</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                                    <span className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                        Embeddings
                                    </span>
                                    <span className="text-blue-700 font-bold text-[10px] bg-blue-50 px-1.5 py-0.5 rounded">
                                        Indexed
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Pipeline Engine Card */}
                        <div className="relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] hover:border-blue-300 hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.14)] transition-all group">
                            <div 
                                aria-hidden="true"
                                className="absolute -bottom-1.5 inset-x-3 h-2 rounded-b-xl bg-slate-100 border border-slate-200/70 -z-10 shadow-2xs group-hover:bg-blue-50/50 transition-colors"
                            />
                            <div>
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Cpu className="w-4 h-4" />
                                        </div>
                                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">
                                            RAG_ENGINE
                                        </span>
                                    </div>
                                    <span className="font-mono text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                        04
                                    </span>
                                </div>
                                <div className="mt-2 text-3xl font-mono font-semibold tracking-tight text-slate-900">
                                    38+
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Modular RAG strategies available</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                                    <span className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                                        <GitBranch className="w-3.5 h-3.5 text-purple-600" />
                                        Architecture
                                    </span>
                                    <span className="text-purple-700 font-bold text-[10px] bg-purple-50 px-1.5 py-0.5 rounded">
                                        Visual DAG
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Instant Forensic Document Scan Slider (Signature Landing Page Element) */}
                <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/80 to-white p-6 sm:p-8 shadow-xs">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            Instant Document Inspection
                        </div>
                        <h2 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                            Slide to analyze any raw document
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500">
                            Drop a PDF or Markdown file to inspect token overlap and recommended chunking boundaries.
                        </p>

                        <div className="mt-4 flex justify-center">
                            <SlideToAnalyze
                                onAnalyze={handleDirectAnalyze}
                                isAnalyzing={isAnalyzing}
                            />
                        </div>
                    </div>
                </section>

                {/* Recent Projects Section */}
                <section className="space-y-4">
                    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
                        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                    <Database className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">Recent Projects</h2>
                                    <p className="text-xs text-slate-500">Active knowledge bases and corpus indices</p>
                                </div>
                            </div>

                            <Link
                                href="/projects"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
                            >
                                View all projects
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="px-6 py-16 text-center">
                                <LoadingSpinner size="md" className="mx-auto mb-3" />
                                <span className="text-slate-400 text-xs font-medium">Loading project catalog...</span>
                            </div>
                        ) : recentProjects.length === 0 ? (
                            <div className="px-6 py-16 text-center max-w-md mx-auto">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-2xs">
                                    <FolderOpen className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900">No projects created yet</h3>
                                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                                    Upload documents, run AI corpus fingerprinting, and wire up optimized chunking pipelines.
                                </p>
                                <Link
                                    href="/projects"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Your First Project
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {recentProjects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/projects/${project.id}`}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-slate-50/70 transition-all group gap-3"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0" />
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                                    {project.name}
                                                </h3>
                                                {project.description && (
                                                    <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
                                                        {project.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 shrink-0 sm:ml-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                {project.total_files} {project.total_files === 1 ? "file" : "files"}
                                            </span>

                                            <span className="flex items-center gap-1.5 font-medium">
                                                <Layers className="w-3.5 h-3.5 text-slate-400" />
                                                {formatNumber(project.total_chunks)} chunks
                                            </span>

                                            {project.dominant_doc_type && (
                                                <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100/80 text-[10px] font-mono font-medium text-blue-700 uppercase">
                                                    {project.dominant_doc_type}
                                                </span>
                                            )}

                                            <span className="font-mono text-[11px] text-slate-400 text-right min-w-[70px]">
                                                {relativeTime(project.updated_at || project.created_at)}
                                            </span>

                                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Toolkit / Quick Actions Section (Exact Landing Page TOOLS Style) */}
                <section className="space-y-6">
                    <div>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Toolkit</p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                            Jump straight into tuning retrieval
                        </h2>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {TOOLKIT.map((tool) => (
                            <Link
                                key={tool.href}
                                href={tool.href}
                                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] hover:border-blue-300 hover:shadow-[0_12px_32px_-16px_rgba(37,99,235,0.25)] transition-all"
                            >
                                <div>
                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <tool.icon className="w-4 h-4" />
                                        </div>
                                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">
                                            {tool.tag}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                                        {tool.title}
                                    </h3>
                                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                                        {tool.body}
                                    </p>
                                </div>

                                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-blue-600">
                                    <span>{tool.actionText}</span>
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* System Capabilities / Stats Strip */}
                <section className="pt-4">
                    <dl className="grid grid-cols-2 md:grid-cols-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 divide-x divide-y md:divide-y-0 divide-slate-200 overflow-hidden">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="p-5 text-center bg-white/60">
                                <dt className="text-xs text-slate-500 font-medium">{stat.label}</dt>
                                <dd className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 font-mono">{stat.value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t border-slate-100 bg-white">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between text-xs text-slate-400">
                    <span>&copy; {new Date().getFullYear()} Weave &bull; Visual RAG Pipeline Builder</span>
                    <Link
                        href="https://github.com/anshika292005/Weave"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-slate-900 transition-colors flex items-center gap-1"
                    >
                        GitHub <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
            </footer>

            {/* Deep Analysis Result Modal */}
            {analysisResult && (
                <AnalysisResultOverlay
                    result={analysisResult}
                    onClose={() => setAnalysisResult(null)}
                    onConfirm={handleConfirmAnalysis}
                />
            )}
        </div>
    )
}
