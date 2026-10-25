"use client"

import React from "react"

const DELAY = 1000 // let the hero fade-in settle before measuring the landing spot
const DURATION = 3800
const SETTLE = 700

type Pt = [number, number]

// Bottom-left -> small doodle loop -> across the top -> far top-right -> swings back to land beside the target.
function buildPath(w: number, h: number, target: Pt): string {
    const s: Pt = [w * 0.05, h - 48]
    const tr: Pt = [w - 56, 104]
    const p = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`
    return [
        `M ${p(...s)}`,
        `C ${p(w * 0.11, h - 90)} ${p(w * 0.02, h * 0.7)} ${p(w * 0.09, h * 0.62)}`,
        `C ${p(w * 0.15, h * 0.55)} ${p(w * 0.17, h * 0.68)} ${p(w * 0.12, h * 0.68)}`,
        `C ${p(w * 0.06, h * 0.68)} ${p(w * 0.05, h * 0.45)} ${p(w * 0.1, h * 0.3)}`,
        `C ${p(w * 0.16, h * 0.14)} ${p(w * 0.4, 112)} ${p(w * 0.62, 98)}`,
        `S ${p(w - 150, 72)} ${p(...tr)}`,
        `C ${p(w - 12, tr[1] + 140)} ${p(target[0] + 220, target[1] + 30)} ${p(...target)}`,
    ].join(" ")
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function PaperPlaneFlight({
    containerRef,
    targetRef,
}: {
    containerRef: React.RefObject<HTMLElement>
    targetRef: React.RefObject<HTMLElement>
}) {
    const trailRef = React.useRef<SVGPathElement>(null)
    const revealRef = React.useRef<SVGPathElement>(null)
    const planeRef = React.useRef<SVGGElement>(null)
    const [d, setD] = React.useState("")
    const progress = React.useRef(0)

    React.useEffect(() => {
        const container = containerRef.current
        const target = targetRef.current
        if (!container || !target) return

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        let raf = 0
        let timer = 0
        let length = 0
        let start = 0

        const measure = () => {
            const c = container.getBoundingClientRect()
            const t = target.getBoundingClientRect()
            const landing: Pt = [t.right - c.left + 46, t.top - c.top + t.height * 0.42]
            const path = buildPath(c.width, c.height, landing)
            trailRef.current?.setAttribute("d", path)
            revealRef.current?.setAttribute("d", path)
            setD(path)
            length = trailRef.current?.getTotalLength() ?? 0
            revealRef.current?.setAttribute("stroke-dasharray", `${length}`)
        }

        const place = (frac: number, wobble = 0) => {
            const trail = trailRef.current
            const plane = planeRef.current
            if (!trail || !plane || !length) return
            const at = length * frac
            const pt = trail.getPointAtLength(at)
            const a = trail.getPointAtLength(Math.max(0, at - 1.5))
            const b = trail.getPointAtLength(Math.min(length, at + 1.5))
            const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
            plane.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${angle + wobble})`)
            plane.style.opacity = "1"
            revealRef.current?.setAttribute("stroke-dashoffset", `${length - at}`)
        }

        const tick = (now: number) => {
            if (!start) start = now
            const elapsed = now - start
            if (elapsed < DURATION) {
                progress.current = easeInOutCubic(elapsed / DURATION)
                place(progress.current)
                raf = requestAnimationFrame(tick)
                return
            }
            progress.current = 1
            const settle = (elapsed - DURATION) / SETTLE
            if (settle < 1) {
                place(1, 9 * Math.sin(settle * Math.PI * 3) * (1 - settle))
                raf = requestAnimationFrame(tick)
            } else {
                place(1)
            }
        }

        const run = () => {
            measure()
            if (reduceMotion) {
                progress.current = 1
                place(1)
                return
            }
            raf = requestAnimationFrame(tick)
        }

        timer = window.setTimeout(() => {
            document.fonts.ready.then(run)
        }, reduceMotion ? 0 : DELAY)

        const ro = new ResizeObserver(() => {
            if (!length) return
            measure()
            place(progress.current, 0)
        })
        ro.observe(container)

        return () => {
            window.clearTimeout(timer)
            cancelAnimationFrame(raf)
            ro.disconnect()
        }
    }, [containerRef, targetRef])

    return (
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <defs>
                <mask id="plane-trail-reveal" maskUnits="userSpaceOnUse">
                    <path ref={revealRef} d={d} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
                </mask>
            </defs>

            {/* Dotted pen trail, revealed behind the plane */}
            <path
                ref={trailRef}
                d={d}
                fill="none"
                stroke="#3B82F6"
                strokeOpacity="0.55"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeDasharray="0.5 9"
                mask="url(#plane-trail-reveal)"
            />

            {/* Pen-drawn paper plane, nose pointing +x */}
            <g ref={planeRef} style={{ opacity: 0 }}>
                <g transform="scale(1.35)" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="#2563EB">
                    <path d="M16 0 L-12 -11 L-6 0 L-12 11 Z" fill="#FFFFFF" strokeWidth="1.5" />
                    <path d="M15.4 0.7 L-11.3 -10.1 M-11.6 10.4 L15.6 -0.5" strokeWidth="0.8" strokeOpacity="0.45" />
                    <path d="M16 0 L-6 0" strokeWidth="1.2" />
                    <path d="M16 0 L-9.5 -5.2 M16 0 L-9.5 5.2" strokeWidth="0.9" strokeOpacity="0.6" />
                </g>
            </g>
        </svg>
    )
}
