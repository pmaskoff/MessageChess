"use client";

import { useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GameReview } from "@/types";
import ReviewDashboard from "@/components/ReviewDashboard";

export default function ReviewPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [review, setReview] = useState<GameReview | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            if (selected.size > 5 * 1024 * 1024) {
                toast.error("File size must be under 5MB");
                return;
            }
            setFile(selected);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch("/api/analyze-screenshot", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setReview(data);
                toast.success("Analysis complete!");
            } else {
                const errData = await res.json();
                toast.error(errData.error || "Failed to analyze screenshot");
            }
        } catch (err) {
            toast.error("An error occurred during analysis");
        } finally {
            setLoading(false);
        }
    };

    if (review) {
        return <ReviewDashboard review={review} onReset={() => setReview(null)} />;
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12 flex flex-col items-center">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2 text-white">
                    Message Chess
                </h1>
                <p className="text-xl text-zinc-400">
                    Upload a screenshot of your text messages to get a Game Review.
                </p>
            </div>

            <Card className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
                <CardHeader>
                    <CardTitle>New Game Review</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Select a screenshot (PNG or JPG) under 5MB.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-center w-full">
                        <label
                            htmlFor="screenshot-upload"
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-zinc-700 border-dashed rounded-lg cursor-pointer hover:bg-zinc-800 hover:border-emerald-500 transition-colors bg-zinc-900/50"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-zinc-400" />
                                <p className="mb-2 text-sm text-zinc-400">
                                    <span className="font-semibold text-emerald-400">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-zinc-500">PNG or JPG (MAX. 5MB)</p>
                            </div>
                            <input
                                id="screenshot-upload"
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    {file && (
                        <div className="p-3 bg-zinc-800 rounded-md border border-zinc-700 flex justify-between items-center">
                            <span className="truncate max-w-[200px] text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    )}

                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg py-6"
                        onClick={handleUpload}
                        disabled={!file || loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Analyzing Game...
                            </>
                        ) : (
                            "Generate Game Review"
                        )}
                    </Button>

                    <p className="text-xs text-center text-zinc-500 mt-4">
                        Disclaimer: This is for entertainment purposes only.
                        Do not share sensitive personal information.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
