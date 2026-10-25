"use client"

import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas"

export default function RivePlayer({ src, stateMachine, onError }: { src: string; stateMachine?: string; onError: () => void }) {
    const { RiveComponent } = useRive({
        src,
        stateMachines: stateMachine,
        autoplay: true,
        layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
        onLoadError: onError,
    })
    return <RiveComponent className="h-full w-full" />
}
