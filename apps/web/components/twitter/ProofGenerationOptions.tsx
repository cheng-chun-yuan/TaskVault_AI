import { Lock, Lightbulb } from "lucide-react";

interface ProofGenerationOptionsProps {
  fileContent: string;
  address: string | undefined;
  isLoading: "client" | "server" | "verifying" | null;
  onGenerateProof: (mode: "client" | "server") => void;
}

export function ProofGenerationOptions({
  fileContent,
  address,
  isLoading,
  onGenerateProof
}: ProofGenerationOptionsProps) {
  const isDisabled = !fileContent || !address || isLoading !== null;

  return (
    <div className="space-y-3 pt-1">
      <div className="text-sm font-semibold text-gray-400 mb-2">Choose generation method:</div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => onGenerateProof("client")}
          disabled={isDisabled}
          className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
            isDisabled
              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
              : "border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 cursor-pointer"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              isDisabled ? "bg-gray-200" : "bg-green-500"
            }`}>
              <Lock className={`h-4 w-4 ${
                isDisabled ? "text-gray-400" : "text-white"
              }`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-blue-700 mb-1">
                {isLoading === "client" ? "Generating..." : "Local Browser"}
              </div>
              <div className={`text-xs ${
                isDisabled ? "text-gray-400" : "text-blue-700"
              }`}>
                Generate proof in your browser (more private)
              </div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => onGenerateProof("server")}
          disabled={isDisabled}
          className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
            isDisabled
              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
              : "border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 cursor-pointer"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              isDisabled ? "bg-gray-200" : "bg-yellow-500"
            }`}>
              <Lightbulb className={`h-4 w-4 ${
                isDisabled ? "text-gray-400" : "text-white"
              }`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-blue-700 mb-1">
                {isLoading === "server" ? "Generating..." : "Server"}
              </div>
              <div className={`text-xs ${
                isDisabled ? "text-gray-400" : "text-blue-700"
              }`}>
                Generate proof on our server (faster)
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}