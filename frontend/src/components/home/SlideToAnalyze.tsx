"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { ArrowRight, Check, ChevronsRight, Plus, FileText, X } from "lucide-react"

interface SlideToAnalyzeProps {
  onAnalyze: (file: File) => void
  isAnalyzing?: boolean
}

export function SlideToAnalyze({ onAnalyze, isAnalyzing }: SlideToAnalyzeProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const [maxDrag, setMaxDrag] = useState<number>(260)
  const x = useMotionValue(0)

  // Measure track width accurately
  useEffect(() => {
    const updateDimensions = () => {
      if (trackRef.current && thumbRef.current) {
        const trackWidth = trackRef.current.clientWidth
        const thumbWidth = thumbRef.current.clientWidth
        const computed = trackWidth - thumbWidth - 10
        if (computed > 60) {
          setMaxDrag(computed)
        }
      }
    }

    updateDimensions()
    const ro = new ResizeObserver(updateDimensions)
    if (trackRef.current) ro.observe(trackRef.current)
    window.addEventListener("resize", updateDimensions)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", updateDimensions)
    }
  }, [selectedFile])

  // Fill width follows drag position
  const fillWidth = useTransform(x, [0, maxDrag], [52, maxDrag + 52])
  // Text opacity dims as thumb approaches
  const textOpacity = useTransform(x, [0, maxDrag * 0.55], [1, 0.1])

  const handlePlusClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Reset thumb to start
      animate(x, 0, { type: "spring", stiffness: 350, damping: 25 })
      setIsUnlocked(false)
    }
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    animate(x, 0, { type: "spring", stiffness: 350, damping: 25 })
    setIsUnlocked(false)
  }

  const handleDragEnd = () => {
    if (!selectedFile || isAnalyzing) return

    // Threshold: if dragged > 80% of track length
    if (x.get() >= maxDrag * 0.8) {
      animate(x, maxDrag, { type: "spring", stiffness: 400, damping: 30 })
      setIsUnlocked(true)
      onAnalyze(selectedFile)

      // Reset after 2s
      setTimeout(() => {
        animate(x, 0, { type: "spring", stiffness: 350, damping: 28 })
        setIsUnlocked(false)
      }, 2000)
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 25 })
    }
  }

  const isDragEnabled = !!selectedFile && !isAnalyzing

  return (
    <div className="w-full max-w-2xl mx-auto my-6 flex flex-col items-center">
      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.txt,.md"
      />

      {/* Main Bar with Plus Button on the Left and Wide Slider Track */}
      <div className="w-full flex items-center gap-2.5 sm:gap-3 p-1.5 sm:p-2 rounded-full bg-white border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
        {/* Plus Circle Button (On the left of the dragger) */}
        <button
          type="button"
          onClick={handlePlusClick}
          className={`relative shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            selectedFile
              ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 hover:scale-105 active:scale-95"
          }`}
          title={selectedFile ? "Click to change file" : "Upload document"}
        >
          {selectedFile ? (
            <FileText className="w-5 h-5 text-blue-600" />
          ) : (
            <Plus className="w-5 h-5 text-white" />
          )}

          {/* Pulsing indicator if no file selected yet */}
          {!selectedFile && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
          )}
        </button>

        {/* Wide Slider Track */}
        <div
          ref={trackRef}
          className={`relative h-11 sm:h-12 flex-1 rounded-full border p-1 select-none overflow-hidden transition-colors ${
            isUnlocked || isAnalyzing
              ? "bg-blue-50 border-blue-300"
              : isDragEnabled
              ? "bg-slate-100/90 border-slate-300/80 hover:border-slate-400"
              : "bg-slate-50 border-slate-200/60 cursor-not-allowed opacity-90"
          }`}
        >
          {/* Progress Fill behind handle */}
          <motion.div
            className="absolute inset-y-1 left-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-90 shadow-xs"
            style={{ width: isDragEnabled ? fillWidth : 0 }}
          />

          {/* High-Contrast Visible Track Label */}
          <motion.div
            style={{ opacity: textOpacity }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none px-12 text-xs font-semibold tracking-wide uppercase font-mono"
          >
            <span className="flex items-center gap-2 truncate">
              {isAnalyzing ? (
                <span className="text-blue-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Analyzing document…
                </span>
              ) : isUnlocked ? (
                <span className="text-white font-bold">Analysis Started!</span>
              ) : selectedFile ? (
                <span className="text-slate-800 font-bold flex items-center gap-1.5">
                  <span className="text-blue-600 font-bold truncate max-w-[130px] sm:max-w-[180px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-slate-400 font-normal">·</span>
                  <span className="text-slate-700 font-semibold">Slide to analyze</span>
                  <ChevronsRight className="w-4 h-4 text-blue-600 animate-pulse" />
                </span>
              ) : (
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <span>Add file with (+) to unlock slide</span>
                </span>
              )}
            </span>
          </motion.div>

          {/* Draggable Handle Thumb */}
          <motion.div
            ref={thumbRef}
            drag={isDragEnabled ? "x" : false}
            dragConstraints={{ left: 0, right: maxDrag }}
            dragElastic={0.04}
            dragMomentum={false}
            style={{ x }}
            onDragEnd={handleDragEnd}
            whileHover={isDragEnabled ? { scale: 1.05 } : {}}
            whileTap={isDragEnabled ? { scale: 0.96 } : {}}
            className={`relative z-10 h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shadow-xs transition-colors ${
              isDragEnabled
                ? "bg-white text-blue-600 border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md"
                : "bg-slate-200 text-slate-400 border border-slate-300/50 cursor-not-allowed"
            }`}
          >
            {isAnalyzing ? (
              <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : isUnlocked ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <ArrowRight className={`w-4 h-4 ${isDragEnabled ? "text-blue-600" : "text-slate-400"}`} />
            )}
          </motion.div>
        </div>

        {/* Clear/Cancel File Button (if file uploaded) */}
        {selectedFile && !isAnalyzing && (
          <button
            type="button"
            onClick={handleRemoveFile}
            className="shrink-0 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
