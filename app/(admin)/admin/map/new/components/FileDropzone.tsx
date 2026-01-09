"use client";

import { Upload, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  label: string;
  accept: string;
  loaded?: boolean;
  loading?: boolean;
  error?: boolean;
  helperText?: string;
  onFileSelect: (file: File) => void;
}

export function FileDropzone({
  label,
  accept,
  loaded,
  loading,
  error,
  helperText,
  onFileSelect,
}: FileDropzoneProps) {
  return (
    <label
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-1 py-2 cursor-pointer transition",
        "bg-neutral-900 hover:bg-neutral-800",
        loaded && "border-green-500/50",
        error && "border-red-500/50",
        !loaded && !error && "border-neutral-700",
      )}
    >
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />

      {loaded ? (
        <CheckCircle className="w-6 h-6 text-green-400" />
      ) : error ? (
        <XCircle className="w-6 h-6 text-red-400" />
      ) : (
        <Upload className="w-6 h-6 text-blue-400" />
      )}

      <span className="text-sm font-medium">{label}</span>

      <span className="text-xs text-neutral-400 text-center">
        {loading
          ? "Procesando archivo…"
          : (helperText ?? "Click o arrastra un archivo")}
      </span>
    </label>
  );
}
