import { useState } from "react";
import { uploadFile, deleteFile } from "./supabase";

export interface UploadProgress {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedUrl: string | null;
}

export function useFileUpload() {
  const [uploadStates, setUploadStates] = useState<
    Record<string, UploadProgress>
  >({});

  const uploadFileWithProgress = async (
    file: File,
    fileId: string,
    onProgress?: (progress: number) => void
  ) => {
    // Initialize upload state
    setUploadStates((prev) => ({
      ...prev,
      [fileId]: {
        isUploading: true,
        progress: 0,
        error: null,
        uploadedUrl: null,
      },
    }));

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadStates((prev) => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            progress: Math.min(prev[fileId]?.progress + 10, 90),
          },
        }));
        onProgress?.(Math.min(uploadStates[fileId]?.progress + 10, 90));
      }, 200);

      const result = await uploadFile(file);

      clearInterval(progressInterval);

      if (result.error) {
        setUploadStates((prev) => ({
          ...prev,
          [fileId]: {
            isUploading: false,
            progress: 0,
            error: result.error.message || "Upload failed",
            uploadedUrl: null,
          },
        }));
        return { success: false, error: result.error.message };
      }

      setUploadStates((prev) => ({
        ...prev,
        [fileId]: {
          isUploading: false,
          progress: 100,
          error: null,
          uploadedUrl: result.data.publicUrl,
        },
      }));

      onProgress?.(100);
      return {
        success: true,
        url: result.data.publicUrl,
        path: result.data.path,
      };
    } catch (error) {
      setUploadStates((prev) => ({
        ...prev,
        [fileId]: {
          isUploading: false,
          progress: 0,
          error: error instanceof Error ? error.message : "Upload failed",
          uploadedUrl: null,
        },
      }));
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  };

  const deleteUploadedFile = async (path: string, fileId: string) => {
    try {
      const result = await deleteFile(path);

      if (result.error) {
        console.error("Delete error:", result.error);
        return { success: false, error: result.error.message };
      }

      // Clear upload state
      setUploadStates((prev) => {
        const newStates = { ...prev };
        delete newStates[fileId];
        return newStates;
      });

      return { success: true };
    } catch (error) {
      console.error("Delete error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  };

  const clearUploadState = (fileId: string) => {
    setUploadStates((prev) => {
      const newStates = { ...prev };
      delete newStates[fileId];
      return newStates;
    });
  };

  return {
    uploadStates,
    uploadFileWithProgress,
    deleteUploadedFile,
    clearUploadState,
  };
}
