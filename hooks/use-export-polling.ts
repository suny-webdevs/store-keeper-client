"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api";
import type { ExportInput } from "@/lib/schemas";
import type { ExportResponse, ExportJob } from "@/types/api";

export function useExportPolling() {
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<"IDLE" | "POLLING" | "COMPLETED" | "FAILED">("IDLE");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const startExportMutation = useMutation({
    mutationFn: async (payload: ExportInput) => {
      setExportStatus("POLLING");
      setDownloadUrl(null);

      const res = await apiFetch<ExportResponse>("/exports", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.data.mode === "sync" && res.data.url) {
        setExportStatus("COMPLETED");
        setDownloadUrl(res.data.url);
        toast.success("Export ready for download");
        // Trigger download
        window.open(res.data.url, "_blank");
        return res.data;
      }

      if (res.data.mode === "async" && res.data.jobId) {
        setPollingJobId(res.data.jobId);
        // Start polling
        pollJob(res.data.jobId);
        return res.data;
      }

      setExportStatus("COMPLETED");
      return res.data;
    },
    onError: (err: unknown) => {
      setExportStatus("FAILED");
      const message = err instanceof ApiError ? err.errors?.[0]?.message || err.message : "Failed to initiate export";
      toast.error(message);
    },
  });

  const pollJob = async (jobId: string) => {
    let attempts = 0;
    const maxAttempts = 20;

    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const res = await apiFetch<ExportJob>(`/exports/${jobId}`);
        if (res.data.status === "COMPLETED" && res.data.url) {
          clearInterval(interval);
          setExportStatus("COMPLETED");
          setDownloadUrl(res.data.url);
          toast.success("Export completed successfully");
          window.open(res.data.url, "_blank");
        } else if (res.data.status === "FAILED") {
          clearInterval(interval);
          setExportStatus("FAILED");
          toast.error("Export generation failed on server");
        }
      } catch {
        // Continue polling until maxAttempts
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setExportStatus("FAILED");
        toast.error("Export polling timed out");
      }
    }, 2000);
  };

  return {
    triggerExport: startExportMutation.mutateAsync,
    isExporting: startExportMutation.isPending || exportStatus === "POLLING",
    exportStatus,
    downloadUrl,
    pollingJobId,
  };
}
