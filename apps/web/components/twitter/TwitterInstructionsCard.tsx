import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { AlertCircle, Shield } from "lucide-react";

export function TwitterInstructionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          How to Verify
        </CardTitle>
        <CardDescription>
          Follow these steps to prove your Twitter ownership
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">1</Badge>
            <div className="text-sm">
              <p className="font-medium">Request Password Reset</p>
              <p className="text-muted-foreground">Send yourself a password reset email from Twitter</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">2</Badge>
            <div className="text-sm">
              <p className="font-medium">Download Email</p>
              <p className="text-muted-foreground">Sign in with Gmail and download the Twitter email as .eml file</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">3</Badge>
            <div className="text-sm">
              <p className="font-medium">Upload & Verify</p>
              <p className="text-muted-foreground">Upload the file and generate your zero-knowledge proof</p>
            </div>
          </div>
        </div>
        
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your email content stays private. Only the proof of ownership is shared.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}