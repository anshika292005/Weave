"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useConfigStore } from "@/stores/useConfigStore"
import { analyzerApi } from "@/lib/api"
import { ArrowRight, BookOpen, Database, FileUp, GitBranch, Github, Layers, Search, Sparkles, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConnectedPageCards } from "@/components/home/ConnectedPageCards"
import { SlideToAnalyze } from "@/components/home/SlideToAnalyze"
import { PaperPlaneFlight } from "@/components/landing/PaperPlaneFlight"

import { useToast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"

const AnalysisResultOverlay = dynamic(
    () => import("@/components/analysis/AnalysisResultOverlay").then(mod => ({ default: mod.AnalysisResultOverlay })),
    { ssr: false }
)

const TOOLS = [
    { href: "/analyze", icon: Search, title: "Analyzer", body: "Inspect token overlap and semantic density for a single document." },
    { href: "/projects", icon: Database, title: "Projects", body: "Build knowledge bases with chunk visualization and evaluation." },
    { href: "/pipeline", icon: GitBranch, title: "Pipeline Builder", body: "Wire up chunking, retrieval and reranking nodes, then run them." },
    { href: "/guide", icon: BookOpen, title: "Strategy Guide", body: "When to use each technique, what it costs, and what it pairs with." },
]

const STATS = [
    { value: "8", label: "Chunking strategies" },
    { value: "17+", label: "Retrieval strategies" },
    { value: "13", label: "Rerankers" },
    { value: "8", label: "Embedding models" },
]

export default function Home() {
    const router = useRouter()
    const { toast } = useToast()
    const [isAnalyzing, setIsAnalyzing] = React.useState(false)
    const setSelectedDocId = useConfigStore((state) => state.setSelectedDocId)

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

    const [analysisResult, setAnalysisResult] = React.useState<any>(null)
    const heroRef = React.useRef<HTMLElement>(null)
    const landingRef = React.useRef<HTMLSpanElement>(null)

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

    return (
        <main className="relative min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-blue-100">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Layers className="text-white w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-semibold tracking-tight text-slate-900">Weave</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm text-slate-500">
                        <Link href="/projects" className="hover:text-blue-600 transition-colors">Projects</Link>
                        <Link href="/pipeline" className="hover:text-blue-600 transition-colors">Pipeline Builder</Link>
                        <Link href="/guide" className="hover:text-blue-600 transition-colors">Strategy Guide</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="https://github.com/anshika292005/Weave" aria-label="GitHub" className="text-slate-400 hover:text-slate-900 transition-colors">
                            <Github className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section ref={heroRef} className="relative pt-32 pb-20 md:pt-40 md:pb-28">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(60%_60%_at_70%_0%,theme(colors.blue.50),transparent)]"
                />
                <PaperPlaneFlight containerRef={heroRef} targetRef={landingRef} />
                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center flex flex-col items-center">
                    <div className="animate-fade-in-up flex flex-col items-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-[-0.03em] leading-[1.05] text-slate-900 text-center">
                            See inside every step of your <span ref={landingRef} className="text-blue-600">RAG pipeline</span>.
                        </h1>

                        <p className="mt-6 text-base md:text-lg text-slate-500 max-w-xl leading-relaxed text-center">
                            Deep dive into your{" "}
                            <span className="relative inline-block text-slate-900 italic font-medium">
                                vector space
                                <svg
                                    className="absolute -bottom-1.5 left-0 w-full overflow-visible"
                                    height="9"
                                    viewBox="0 0 110 9"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M2 6.5C18 3.5 38 7 55 4.5C72 2 92 6.5 108 3.5"
                                        stroke="#f59e0b"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M14 7.5C32 4.5 60 7.8 82 5C96 3.2 104 5 107 4.2"
                                        stroke="#f59e0b"
                                        strokeWidth="1.2"
                                        strokeLinecap="round"
                                        opacity="0.6"
                                    />
                                </svg>
                            </span>
                            . Visualize semantic chunks, debug retrieval quality, and optimize your knowledge graph with forensic precision.
                        </p>

                        {/* Quick Analyze Slider */}
                        <div className="mt-8 w-full max-w-2xl flex justify-center">
                            <SlideToAnalyze
                                onAnalyze={handleDirectAnalyze}
                                isAnalyzing={isAnalyzing}
                            />
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
                            <Link href="/projects" className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                Create a project <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link href="/pipeline" className="text-slate-500 hover:text-slate-900 transition-colors">
                                Open pipeline builder
                            </Link>
                            <Link href="/guide" className="text-slate-500 hover:text-slate-900 transition-colors">
                                Read the strategy guide
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works - Connected Page Cards */}
            <section className="border-t border-slate-100 bg-slate-50/60">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 md:py-24">
                    <div className="max-w-xl">
                        <p className="text-sm font-medium text-blue-600">How it works</p>
                        <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                            From raw files to a tested pipeline.
                        </h2>
                    </div>

                    <div className="mt-12">
                        <ConnectedPageCards />
                    </div>
                </div>
            </section>

            {/* Toolkit */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 md:py-24">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div className="max-w-xl">
                        <p className="text-sm font-medium text-blue-600">Toolkit</p>
                        <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                            Everything you need to tune retrieval.
                        </h2>
                    </div>
                    <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Go to dashboard <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {TOOLS.map((tool) => (
                        <Link
                            key={tool.href}
                            href={tool.href}
                            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-[0_12px_32px_-16px_rgba(37,99,235,0.25)] transition-all"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                <tool.icon className="w-4 h-4 text-blue-600" />
                            </div>
                            <h3 className="mt-5 text-base font-semibold text-slate-900">{tool.title}</h3>
                            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed flex-grow">{tool.body}</p>
                            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600">
                                Open <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                            </span>
                        </Link>
                    ))}
                </div>

                <dl className="mt-16 grid grid-cols-2 md:grid-cols-4 rounded-2xl border border-slate-200 divide-x divide-y md:divide-y-0 divide-slate-200 overflow-hidden">
                    {STATS.map((stat) => (
                        <div key={stat.label} className="p-6 text-center">
                            <dt className="text-xs text-slate-500">{stat.label}</dt>
                            <dd className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 font-mono">{stat.value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* Final CTA */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
                <div className="relative overflow-hidden rounded-3xl bg-blue-600 px-6 py-14 md:px-14 md:py-16 text-center">
                    <div
                        aria-hidden
                        className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:22px_22px]"
                    />
                    <div className="relative">
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                            Build a RAG pipeline that fits your documents.
                        </h2>
                        <p className="mt-3 text-blue-100 max-w-lg mx-auto">
                            Start with a project, upload a few files and let the analysis pick the techniques.
                        </p>
                        <Link
                            href="/projects"
                            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 text-sm font-medium hover:bg-blue-50 transition-colors"
                        >
                            Get started <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="border-t border-slate-100">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between text-xs text-slate-400">
                    <span>&copy; {new Date().getFullYear()} Weave</span>
                    <Link href="https://github.com/anshika292005/Weave" className="hover:text-slate-900 transition-colors">
                        GitHub
                    </Link>
                </div>
            </footer>

            {analysisResult && (
                <AnalysisResultOverlay
                    result={analysisResult}
                    onClose={() => setAnalysisResult(null)}
                    onConfirm={handleConfirmAnalysis}
                />
            )}
        </main>
    )
}
