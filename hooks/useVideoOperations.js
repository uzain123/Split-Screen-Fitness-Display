import { useState } from "react";
import { toast } from "./use-toast";

export const useVideoOperations = (setVideos, assignments, setAssignments) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState("");

  const getVideoDisplayName = (video) => {
    if (typeof video === "string") {
      return video.split("/").pop();
    }
    const videoPath = video?.name || video?.url || "Unknown video";
    return videoPath.split("/").pop();
  };

  const extractS3KeyFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return decodeURIComponent(urlObj.pathname.slice(1));
    } catch (err) {
      console.error("Invalid URL:", url);
      return null;
    }
  };

  const handleFileUpload = async (file, fileInputRef) => {
    if (!file) return;

    // Check if file is MP4
    if (!file.type.includes("mp4") && !file.name.toLowerCase().endsWith(".mp4")) {
      toast({
        title: "Invalid File Type",
        description: "Only MP4 files are allowed. Please select a .mp4 video file.",
        variant: "destructive"
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Check file size (e.g., 500MB limit)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "File too large. Max size is 500MB.",
        variant: "destructive"
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);

    try {
      // Step 1: Get pre-signed S3 URL from API
      const presignRes = await fetch("/api/videos/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type
        })
      });

      if (!presignRes.ok) {
        const err = await presignRes.json();
        throw new Error(err.error || "Failed to get S3 upload URL.");
      }

      const { uploadUrl, key } = await presignRes.json();

      // Step 2: Upload file to S3 using signed URL
      const s3Upload = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type
        },
        body: file
      });

      if (!s3Upload.ok) {
        throw new Error("Upload to S3 failed.");
      }

      // Step 3: Update video list
      const videosRes = await fetch("/api/videos");
      const videoData = await videosRes.json();
      setVideos(videoData || []);

      // Success UI
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast({
        title: "Upload Successful",
        description: "Video uploaded successfully!",
        variant: "default"
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Upload failed: " + error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (videoUrl) => {
    console.log("🟡 Starting delete for video:", videoUrl);

    // Extract the S3 key properly from the URL
    let key;

    if (typeof videoUrl === "string") {
      if (videoUrl.includes("amazonaws.com") || videoUrl.includes("s3")) {
        try {
          const url = new URL(videoUrl);
          key = decodeURIComponent(url.pathname.slice(1));
          console.log("🟡 Extracted key from URL:", key);
        } catch (err) {
          console.error("❌ Failed to parse URL:", videoUrl);
          toast({
            title: "Invalid URL",
            description: "Invalid video URL format",
            variant: "destructive"
          });
          return;
        }
      } else {
        const fileName = videoUrl.split("/").pop();
        key = `videos/${fileName}`;
        console.log("🟡 Constructed key for filename:", key);
      }
    } else {
      const fileName = getVideoDisplayName(videoUrl);
      key = `videos/${fileName}`;
      console.log("🟡 Constructed key from object:", key);
    }

    setDeleting(videoUrl);

    try {
      console.log("🟡 Sending delete request with key:", key);

      const response = await fetch("/api/videos/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ key })
      });

      console.log("🟡 Delete response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Delete successful:", result);

        // Refresh the video list
        const videosRes = await fetch("/api/videos");
        if (videosRes.ok) {
          const videoData = await videosRes.json();
          setVideos(videoData || []);
          console.log("✅ Video list refreshed");
        }

        // Remove video from assignments
        const updated = [...assignments];
        updated.forEach((assignment, index) => {
          if (assignment && assignment.url === videoUrl) {
            updated[index] = null;
            console.log(`✅ Removed video from assignment ${index}`);
          }
        });
        setAssignments(updated);

        toast({
          title: "Delete Successful",
          description: "Video deleted successfully!",
          variant: "default"
        });
      } else {
        const error = await response.json();
        console.error("❌ Delete failed with status:", response.status, error);
        toast({
          title: "Delete Failed",
          description: `Delete failed: ${error.error || "Unknown error"}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("❌ Delete request failed:", error);
      toast({
        title: "Delete Failed",
        description: `Delete failed: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleRenameVideo = async (videoUrl, newFileName) => {
    const oldKey = extractS3KeyFromUrl(videoUrl);
    if (!oldKey) {
      toast({
        title: "Rename Failed",
        description: "Failed to extract S3 key from URL.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch("/api/videos/rename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          oldKey,
          newKey: newFileName
        })
      });

      if (response.ok) {
        const videosRes = await fetch("/api/videos");
        const videoData = await videosRes.json();
        setVideos(videoData || []);

        const newVideoUrl = videoUrl.replace(oldKey, newFileName);
        const updated = [...assignments];
        updated.forEach((assignment, index) => {
          if (assignment && assignment.url === videoUrl) {
            updated[index] = { ...assignment, url: newVideoUrl };
          }
        });
        setAssignments(updated);

        setRenaming(null);
        setNewName("");

        toast({
          title: "Rename Successful",
          description: "Video renamed successfully!",
          variant: "default"
        });
      } else {
        const error = await response.json();
        console.error("Rename failed:", error);
        toast({
          title: "Rename Failed",
          description: "Rename failed: " + error.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Rename error:", error);
      toast({
        title: "Rename Failed",
        description: "Rename failed: " + error.message,
        variant: "destructive"
      });
    }
  };

  const startRename = (videoUrl) => {
    setRenaming(videoUrl);
    setNewName(getVideoDisplayName(videoUrl));
  };

  const cancelRename = () => {
    setRenaming(null);
    setNewName("");
  };

  const submitRename = (videoUrl) => {
    if (newName.trim() && newName !== getVideoDisplayName(videoUrl)) {
      handleRenameVideo(videoUrl, newName.trim());
    } else {
      cancelRename();
    }
  };

  return {
    uploading,
    deleting,
    renaming,
    newName,
    setNewName,
    getVideoDisplayName,
    handleFileUpload,
    handleDeleteVideo,
    startRename,
    cancelRename,
    submitRename
  };
};
