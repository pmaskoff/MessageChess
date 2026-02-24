"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Image as ImageIcon, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function NavBar() {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === "/login" || pathname === "/") return null;

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
            toast.success("Logged out successfully");
        } catch (e) {
            toast.error("Logout failed");
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
            <div className="container mx-auto max-w-6xl px-4 flex h-14 items-center justify-between">
                <div className="flex items-center space-x-6">
                    <Link href="/review" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
                        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Message Chess
                        </span>
                    </Link>

                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/review"
                            className={`flex items-center space-x-2 transition-colors hover:text-emerald-400 ${pathname === "/review" ? "text-emerald-400" : "text-zinc-400"
                                }`}
                        >
                            <ImageIcon className="w-4 h-4" />
                            <span>Review</span>
                        </Link>
                        <Link
                            href="/puzzles"
                            className={`flex items-center space-x-2 transition-colors hover:text-emerald-400 ${pathname.startsWith("/puzzles") ? "text-emerald-400" : "text-zinc-400"
                                }`}
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>Puzzles</span>
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Exit
                    </Button>
                </div>
            </div>
        </nav>
    );
}
