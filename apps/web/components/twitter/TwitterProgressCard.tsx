import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Proof } from "@zk-email/sdk";

interface TwitterProgressCardProps {
  fileContent: string;
  isLoading: "client" | "server" | "verifying" | null;
  proof: Proof | null;
  verificationStatus: string;
}

export function TwitterProgressCard({ 
  fileContent, 
  isLoading, 
  proof, 
  verificationStatus 
}: TwitterProgressCardProps) {
  const getProgressValue = () => {
    if (!fileContent) return 0;
    if (isLoading === "client" || isLoading === "server") return 33;
    if (isLoading === "verifying") return 66;
    if (proof && verificationStatus.includes("✅")) return 100;
    return 0;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Verification Progress</CardTitle>
          <Badge variant={proof && verificationStatus.includes("✅") ? "default" : "secondary"}>
            {getProgressValue()}% Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={getProgressValue()} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>Upload Email</span>
          <span>Generate Proof</span>
          <span>Verify on-chain</span>
        </div>
      </CardContent>
    </Card>
  );
}