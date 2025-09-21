import { useState } from "react";

interface UseFileUploadReturn {
  fileContent: string;
  fileName: string;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clearFile: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const clearFile = () => {
    setFileContent("");
    setFileName("");
  };

  return {
    fileContent,
    fileName,
    handleFileUpload,
    clearFile,
  };
}