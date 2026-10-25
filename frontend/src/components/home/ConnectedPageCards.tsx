"use client"

import React from "react"
import { motion } from "framer-motion"
import { Upload, Sparkles, GitBranch, Search, ArrowRight, CheckCircle2, FileText, Layers, Cpu } from "lucide-react"

interface StepItem {
  number: string
  title: string
  body: string
  tag: string
  icon: React.ElementType
  preview: React.ReactNode
}

export function ConnectedPageCards() {
  const steps: StepItem[] = [
    {
      number: "01",
      title: "Upload",
      tag: "DOC_SOURCE",
      icon: Upload,
      body: "Add single files, a ZIP or a whole folder. Uploads are parsed instantly.",
      preview: (
        <div className="space-y-1.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium">
            <span className="flex items-center gap-1 truncate font-mono">
              <FileText className="w-3 h-3 text-blue-600" />
              knowledge.pdf
            </span>
            <span className="text-emerald-600 font-bold text-[9px] bg-emerald-50 px-1 rounded">14.2k tok</span>
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="w-full h-1.5 bg-slate-200 rounded-full" />
            <div className="w-4/5 h-1.5 bg-slate-200 rounded-full" />
          </div>
        </div>
      )
    },
    {
      number: "02",
      title: "Analyze",
      tag: "SEMANTIC_SPLIT",
      icon: Sparkles,
      body: "Corpus fingerprinting plus an LLM profile to find optimal chunk boundaries.",
      preview: (
        <div className="space-y-1.5 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100/80">
          <div className="flex items-center justify-between text-[10px] text-blue-800 font-medium">
            <span className="font-mono text-[9px]">Chunk Strategy</span>
            <span className="text-blue-600 font-bold text-[9px] bg-white px-1.5 py-0.5 rounded shadow-2xs">Semantic</span>
          </div>
          <div className="grid grid-cols-2 gap-1 pt-0.5">
            <div className="p-1 rounded bg-white border border-blue-100 text-[8px] font-mono text-slate-500 text-center">
              Chunk A <span className="text-blue-600 font-bold">512t</span>
            </div>
            <div className="p-1 rounded bg-white border border-blue-100 text-[8px] font-mono text-slate-500 text-center">
              Chunk B <span className="text-blue-600 font-bold">384t</span>
            </div>
          </div>
        </div>
      )
    },
    {
      number: "03",
      title: "Build",
      tag: "PIPELINE_DAG",
      icon: GitBranch,
      body: "Open the recommended pipeline in the visual builder and tune nodes.",
      preview: (
        <div className="space-y-1.5 p-2.5 rounded-lg bg-purple-50/60 border border-purple-100/80">
          <div className="flex items-center justify-between text-[10px] text-purple-800 font-medium">
            <span className="font-mono text-[9px]">Pipeline Nodes</span>
            <span className="text-purple-600 font-bold text-[9px]">3 Active</span>
          </div>
          <div className="flex items-center justify-between gap-1 pt-0.5 text-[8px] font-mono">
            <span className="px-1.5 py-0.5 rounded bg-white border border-purple-100 text-purple-700">Splitter</span>
            <span className="text-slate-300">→</span>
            <span className="px-1.5 py-0.5 rounded bg-white border border-purple-100 text-purple-700">Embedder</span>
            <span className="text-slate-300">→</span>
            <span className="px-1.5 py-0.5 rounded bg-white border border-purple-100 text-purple-700">pgvector</span>
          </div>
        </div>
      )
    },
    {
      number: "04",
      title: "Evaluate",
      tag: "RAGAS_BENCH",
      icon: Search,
      body: "Run real queries, get graded answers and latency diffs, then export code.",
      preview: (
        <div className="space-y-1.5 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100/80">
          <div className="flex items-center justify-between text-[10px] text-emerald-800 font-medium">
            <span className="flex items-center gap-1 font-mono text-[9px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Faithfulness
            </span>
            <span className="text-emerald-700 font-bold text-[9px] bg-white px-1.5 py-0.5 rounded shadow-2xs">98.2%</span>
          </div>
          <div className="w-full bg-emerald-200/60 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[98%]" />
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="w-full relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => (
          <div key={step.title} className="relative flex flex-col">
            {/* Connector bridge between cards (desktop) */}
            {idx < steps.length - 1 && (
              <div 
                aria-hidden="true" 
                className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 w-6 items-center justify-center z-20 pointer-events-none"
              >
                {/* SVG connection wire with animated flow packet */}
                <svg className="w-6 h-6 overflow-visible" viewBox="0 0 24 24">
                  <line 
                    x1="0" 
                    y1="12" 
                    x2="24" 
                    y2="12" 
                    stroke="#93c5fd" 
                    strokeWidth="2" 
                    strokeDasharray="3 3" 
                  />
                  {/* Moving pulse dot along connection line */}
                  <motion.circle
                    cx="0"
                    cy="12"
                    r="3"
                    fill="#2563eb"
                    animate={{ cx: [0, 24] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.6,
                      ease: "linear",
                      delay: idx * 0.4
                    }}
                  />
                </svg>
              </div>
            )}

            {/* Page Card Container */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative flex flex-col justify-between h-full bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] hover:border-blue-300 hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.14)] transition-all group"
            >
              {/* Stacked Sheet Underneath Effect (Looks like real document paper) */}
              <div 
                aria-hidden="true"
                className="absolute -bottom-1.5 inset-x-3 h-2 rounded-b-xl bg-slate-100 border border-slate-200/70 -z-10 shadow-2xs group-hover:bg-blue-50/50 transition-colors"
              />

              {/* Input & Output Socket Nodes on Card Edges */}
              {idx > 0 && (
                <div 
                  aria-hidden="true"
                  className="hidden lg:block absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-500 shadow-2xs z-30"
                />
              )}
              {idx < steps.length - 1 && (
                <div 
                  aria-hidden="true"
                  className="hidden lg:block absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-500 shadow-2xs z-30"
                />
              )}

              {/* Card Header (Document Page Tab) */}
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <step.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">
                      {step.tag}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                    {step.number}
                  </span>
                </div>

                {/* Card Title & Description */}
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  {step.body}
                </p>
              </div>

              {/* Mini Document Inspection Preview */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {step.preview}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}
