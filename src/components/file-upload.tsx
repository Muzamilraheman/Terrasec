"use client";

import { useCallback } from 'react';
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileChange: (content: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange }) => {
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        console.error("No file selected");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileChange(content);
      };

      reader.onerror = () => {
        console.error("Failed to read file");
      };

      reader.readAsText(file);
    },
    [onFileChange]
  );

  return (
    <div>
      <input
        type="file"
        id="file-upload"
        accept=".tf"
        className="hidden"
        onChange={handleFileSelect}
      />
      <label htmlFor="file-upload">
        <Button asChild>
          <span>Upload Terraform File</span>
        </Button>
      </label>
    </div>
  );
};
