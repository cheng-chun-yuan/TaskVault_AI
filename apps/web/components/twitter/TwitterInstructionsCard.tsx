import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { AlertCircle, Shield } from "lucide-react";

export function TwitterInstructionsCard() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          How to Verify
        </CardTitle>
        <CardDescription>
          Follow these steps to prove your Twitter ownership
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <Badge variant="outline" className="mt-1 min-w-6 h-6 flex items-center justify-center">1</Badge>
            <div className="text-sm leading-relaxed">
              <p className="font-semibold text-gray-400 mb-1">Request Password Reset</p>
              <p className="text-muted-foreground leading-6">Send yourself a password reset email from Twitter</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Badge variant="outline" className="mt-1 min-w-6 h-6 flex items-center justify-center">2</Badge>
            <div className="text-sm leading-relaxed">
              <p className="font-semibold text-gray-400 mb-1">Download Email</p>
              <p className="text-muted-foreground leading-6">Sign in with Gmail and download the Twitter email as .eml file</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Badge variant="outline" className="mt-1 min-w-6 h-6 flex items-center justify-center">3</Badge>
            <div className="text-sm leading-relaxed">
              <p className="font-semibold text-gray-400 mb-1">Upload & Verify</p>
              <p className="text-muted-foreground leading-6">Upload the file and generate your zero-knowledge proof</p>
            </div>
          </div>
        </div>
        
        <Alert className="bg-blue-50 border-blue-200">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 leading-6">
            Your email content stays private. Only the proof of ownership is shared.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}