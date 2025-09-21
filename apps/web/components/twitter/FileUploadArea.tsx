import { Upload, CheckCircle } from "lucide-react";

interface FileUploadAreaProps {
  fileContent: string;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUploadArea({ fileContent, onFileUpload }: FileUploadAreaProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-400">Upload Twitter Email</label>
      <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
        fileContent 
          ? "border-green-300 bg-green-50 hover:bg-green-100" 
          : "border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100"
      }`}>
        <input
          type="file"
          onChange={onFileUpload}
          className="hidden"
          id="email-upload"
          accept=".eml,.txt"
        />
        <label htmlFor="email-upload" className="cursor-pointer block">
          {fileContent ? (
            <div className="space-y-2">
              <div className="mx-auto w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">Email loaded successfully</p>
                <p className="text-xs text-green-600 mt-1">Ready to generate proof</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800">Click to upload email file</p>
                <p className="text-xs text-blue-600 mt-1">Supports .eml and .txt files</p>
              </div>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}