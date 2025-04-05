"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import SelfQRcodeWrapper, { countries, SelfApp, SelfAppBuilder } from "@selfxyz/qrcode";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import {
  Award,
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Upload,
  User,
} from "lucide-react";
import { logo } from "@/components/task/logo";
import { useAccount, usePublicClient } from "wagmi";
import { SubmissionRegistry } from "@/content/address";
import { SubmissionRegistryAbi } from "@/content/abi";

// Mock data - in a real app this would come from an API or blockchain
const mockTasks = {
  demo: {
    id: "demo",
    title: "Create a Landing Page for DeFi Protocol",
    description:
      "Design and implement a responsive landing page for our new DeFi protocol. The page should clearly explain our product, showcase key features, and have a modern design.",
    criteria: [
      "Responsive design (mobile, tablet, desktop)",
      "Clear explanation of the protocol",
      "Modern and professional UI",
      "Fast loading time",
      "Accessible design",
    ],
    deadline: "April 15, 2025",
    prize: "2 ETH",
    status: "Open",
    submissions: 3,
    creator: "0x1234...5678",
  },
  new: {
    id: "new",
    title: "New Task",
    description: "This is a newly created task.",
    criteria: ["Criterion 1", "Criterion 2"],
    deadline: "April 30, 2025",
    prize: "0.5 ETH",
    status: "Open",
    submissions: 0,
    creator: "0x1234...5678",
  },
};

export default function TaskPageClient({ taskId }: { taskId: string }) {
  const [showQR, setShowQR] = useState(false);
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  useEffect(() => {
    const checkRegistration = async () => {
      if (!address || !publicClient || !isConnected) return;
      try {
        const isRegistered = await publicClient.readContract({
          address: SubmissionRegistry,
          abi: SubmissionRegistryAbi,
          functionName: 'verifiedUsers',
          args: [taskId, address],
        }) as boolean;
        setIsRegistered(isRegistered);
      } catch (error) {
        console.error('Error checking registration:', error);
        setIsRegistered(false);
      }
    };
    checkRegistration();
  }, [address, publicClient, taskId]);
  const [revealStyle, setRevealStyle] = useState(false);
  const task = mockTasks[taskId as keyof typeof mockTasks] || mockTasks.demo;
  const statusColor = {
    Open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Judging:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    Closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  const disclosures = {
    // Custom checks
    minimumAge: 18,
    excludedCountries: [
      countries.IRAN,
      countries.IRAQ,
      countries.NORTH_KOREA,
      countries.RUSSIA,
      countries.SYRIAN_ARAB_REPUBLIC,
      countries.VENEZUELA
    ],
    ofac: true,
  };

  useEffect(() => {
    if (!address) return
    const selfApp = new SelfAppBuilder({
      appName: "TaskVault AI",
      scope: "trustjudge-ai",
      endpoint: `https://novel-rapidly-panda.ngrok-free.app/api/verify/${taskId}`,
      endpointType: "https",
      logoBase64: logo,
      userId: address,
      userIdType: "hex",
      disclosures: {
          ...disclosures,
          minimumAge: disclosures.minimumAge > 0 ? disclosures.minimumAge : undefined
      },
      devMode: false,
    } as Partial<SelfApp>).build();
    setSelfApp(selfApp);
  }, [address, taskId]);

  const handleSuccess = async () => {
    console.log("Verification successful");
  };

  return (
    <div className="container mx-auto max-w-7xl py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{task.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              className={statusColor[task.status as keyof typeof statusColor]}
            >
              {task.status}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Deadline: {task.deadline}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {!isRegistered ? (
            <Button variant="outline" onClick={() => setShowQR(true)}>
              <User className="mr-2 h-4 w-4" />
              Register
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/task/${taskId}/submit`}>
                <Upload className="mr-2 h-4 w-4" />
                Submit
              </Link>
            </Button>
          )}

          {task.status === "Judging" && (
            <Button variant="outline" asChild>
              <Link href={`/task/${taskId}/judge`}>
                <Eye className="mr-2 h-4 w-4" />
                Judge
              </Link>
            </Button>
          )}
        </div>
      </div>
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="p-6 border rounded-lg bg-white dark:bg-zinc-900 shadow-xl text-center max-w-sm w-full">
            <p className="mb-4 text-sm text-muted-foreground">
              Scan to Verify and Register the Task !!
            </p>
            <SelfQRcodeWrapper
              selfApp={selfApp!}
              onSuccess={handleSuccess}
              darkMode={true}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setShowQR(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions
            <Badge variant="secondary" className="ml-2">
              {task.submissions}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Task Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{task.description}</p>

                <h3 className="font-semibold mt-6 mb-2">Criteria</h3>
                <ul className="space-y-1">
                  {task.criteria.map((criterion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prize</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-xl font-mono">{task.prize}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creator</span>
                    <span className="font-mono text-sm">{task.creator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>April 1, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Left</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      14 days
                    </span>
                  </div>
                </CardContent>
              </Card>

              {task.status === "Open" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Judge Style</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {revealStyle ? (
                      <div className="space-y-2">
                        <p className="text-sm">
                          Judge Style:{" "}
                          <span className="font-mono">strict_technical</span>
                        </p>
                        <p className="text-sm">
                          Salt: <span className="font-mono">r4nd0m_s4lt</span>
                        </p>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setRevealStyle(true)}
                      >
                        Reveal Style
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="submissions">
          {task.submissions > 0 ? (
            <div className="space-y-4">
              {[...Array(task.submissions)].map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Submission #{index + 1}
                          {index === 0 && task.status === "Closed" && (
                            <Badge className="bg-primary">Winner</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <User className="h-3 w-3" />
                          0x8765...4321
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {task.status === "Closed"
                          ? index === 0
                            ? "Score: 9.5/10"
                            : "Score: 7.8/10"
                          : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {index === 0
                        ? "I've created a responsive landing page with a modern design that clearly explains the protocol's features and benefits."
                        : "Here's my submission for the landing page design. I focused on making it user-friendly and visually appealing."}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="gap-1">
                      <FileText className="h-4 w-4" />
                      View Submission
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No submissions yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to submit a solution to this task!
              </p>
              <Button asChild>
                <Link href={`/task/${taskId}/submit`}>Submit Solution</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
