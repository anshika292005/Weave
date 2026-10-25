"use client"

import React from "react"
import dynamic from "next/dynamic"

// Drop a calm, blue/white .riv here to replace the SVG sketch below.
const HERO_RIV = "/rive/hero.riv"

// Only pull in the Rive runtime when there is a file to play.
const RivePlayer = dynamic(() => import("./RivePlayer"), { ssr: false })

export function RiveHero({ stateMachine }: { stateMachine?: string }) {
    const [useRiveFile, setUseRiveFile] = React.useState(false)

    React.useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        let cancelled = false
        fetch(HERO_RIV, { method: "HEAD" })
            .then((res) => !cancelled && setUseRiveFile(res.ok))
            .catch(() => {})
        return () => {
            cancelled = true
        }
    }, [])

    if (useRiveFile) {
        return <RivePlayer src={HERO_RIV} stateMachine={stateMachine} onError={() => setUseRiveFile(false)} />
    }
    return <PipelineSketch />
}

// Document -> chunks -> vector space -> retrieval, drawn in the landing palette.
const DOTS: [number, number][] = [
    [300, 96], [328, 120], [352, 88], [384, 110], [416, 92], [446, 124],
    [306, 150], [338, 170], [436, 150], [312, 206], [428, 236], [452, 196],
    [298, 262], [330, 286], [362, 262], [392, 290], [424, 270], [448, 304],
    [316, 316], [356, 314], [408, 322], [440, 178], [366, 128],
]
const QUERY: [number, number] = [380, 196]
const HITS: [number, number][] = [[396, 214], [402, 160], [344, 228]]
const LANES = [132, 172, 212, 252]
const DOC_LINES = [92, 112, 76, 104, 96, 64, 108, 88, 100, 72]

function PipelineSketch() {
    return (
        <svg viewBox="0 0 480 400" className="h-full w-full" role="img" aria-label="A document is split into chunks, embedded into vector space, and the closest chunks are retrieved for a query">
            {/* Document */}
            <rect x="28" y="84" width="132" height="232" rx="12" fill="#FFFFFF" stroke="#DBEAFE" strokeWidth="1.5" />
            <rect x="46" y="102" width="56" height="8" rx="4" fill="#BFDBFE" />
            {DOC_LINES.map((w, i) => (
                <rect key={i} x="46" y={126 + i * 17} width={w} height="5" rx="2.5" fill="#E2E8F0" />
            ))}
            <clipPath id="weave-doc-clip">
                <rect x="28" y="84" width="132" height="232" rx="12" />
            </clipPath>
            <g clipPath="url(#weave-doc-clip)">
                <rect className="weave-scan" x="28" y="96" width="132" height="24" fill="#3B82F6" fillOpacity="0.08" />
            </g>

            {/* Chunk lanes */}
            {LANES.map((y, i) => (
                <g key={y}>
                    <line x1="172" y1={y + 7} x2="282" y2={y + 7} stroke="#DBEAFE" strokeWidth="1" strokeDasharray="2 4" />
                    <rect
                        className="weave-chunk"
                        style={{ animationDelay: `${i * 0.35}s` }}
                        x="172"
                        y={y}
                        width="36"
                        height="14"
                        rx="4"
                        fill="#EFF6FF"
                        stroke="#93C5FD"
                    />
                </g>
            ))}

            {/* Vector space */}
            {DOTS.map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="#DBEAFE" />
            ))}
            {HITS.map(([cx, cy], i) => (
                <g key={i}>
                    <line
                        className="weave-link"
                        style={{ animationDelay: `${i * 0.15}s` }}
                        x1={QUERY[0]}
                        y1={QUERY[1]}
                        x2={cx}
                        y2={cy}
                        stroke="#2563EB"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <circle cx={cx} cy={cy} r="5" fill="#BFDBFE" />
                    <circle className="weave-hit" style={{ animationDelay: `${i * 0.15}s` }} cx={cx} cy={cy} r="5" fill="#2563EB" />
                </g>
            ))}
            <circle className="weave-pulse" cx={QUERY[0]} cy={QUERY[1]} r="9" fill="#3B82F6" />
            <circle cx={QUERY[0]} cy={QUERY[1]} r="9" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
            <circle cx={QUERY[0]} cy={QUERY[1]} r="3" fill="#2563EB" />

            {/* Labels */}
            <g className="font-mono" fontSize="10" fill="#94A3B8" letterSpacing="0.08em">
                <text x="94" y="344" textAnchor="middle">DOCUMENT</text>
                <text x="227" y="344" textAnchor="middle">CHUNKS</text>
                <text x="375" y="344" textAnchor="middle">VECTOR SPACE</text>
            </g>
        </svg>
    )
}
