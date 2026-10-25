"use client";

import React from "react";
import Link from "next/link";
import { Github, Layers } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) =>
        pathname === path || (path !== '/' && pathname.startsWith(path));

    return (
        <header className="w-full h-16 border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-50">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 h-full flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
                        <Layers className="text-white w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-semibold tracking-tight text-slate-900">Weave</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm text-slate-500">
                    <Link
                        href="/projects"
                        className={cn(
                            "hover:text-blue-600 transition-colors",
                            isActive('/projects') && "text-blue-600 font-semibold"
                        )}
                    >
                        Projects
                    </Link>
                    <Link
                        href="/pipeline"
                        className={cn(
                            "hover:text-blue-600 transition-colors",
                            isActive('/pipeline') && "text-blue-600 font-semibold"
                        )}
                    >
                        Pipeline Builder
                    </Link>
                    <Link
                        href="/guide"
                        className={cn(
                            "hover:text-blue-600 transition-colors",
                            isActive('/guide') && "text-blue-600 font-semibold"
                        )}
                    >
                        Strategy Guide
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link
                        href="https://github.com/anshika292005/Weave"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="GitHub"
                        className="text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <Github className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/dashboard"
                        className={cn(
                            "px-4 py-2 text-xs font-medium rounded-lg transition-colors",
                            isActive('/dashboard')
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        </header>
    );
}
