"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { countries } from "@selfxyz/qrcode";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
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
import { useRegistrationStatus, useSelfVerification } from "@/hooks";
import { SelfQRModal } from "@/components/ui/global";
import { getTaskById } from "@/lib/tasks";

interface Submission {
  id: string;
  content?: string;
  score?: string;
}

interface Task {
  taskId?: string;
  id?: string; // Support both taskId and id from different sources
  title: string;
  description?: string;
  criteria?: string[];
  deadline?: Date | string;
  tokenAddress?: string;
  amount?: string | number;
  styleCommit?: string;
  taskType?: string;
  maxPerTime?: string | null;
  maxPerDay?: string | null;
  createdAt?: Date;
  createdBy?: string;
  submissions?: Submission[] | number;
  status?: "Open" | "Judging" | "Closed" | string;
  salt?: string;
}

export default function TaskPageClient({ taskId }: { taskId: string }) {
  // Move all Hooks to the top and ensure they are always called
  const [showQR, setShowQR] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealStyle, setRevealStyle] = useState(false);
  
  // Use the modern hooks for registration status and self verification
  const { isRegistered } = useRegistrationStatus(taskId);
  const { selfApp } = useSelfVerification(
    "HiveMind",
    "hivemind-ai",
    {
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
      name: true,
      nationality: true,
      date_of_birth: true,
    },
    {
      endpoint: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://novel-rapidly-panda.ngrok-free.app'}/api/verify/${taskId}`,
      endpointType: "https",
      taskId
    }
  );

  // Fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const fetchedTask = await getTaskById(taskId);
        if (fetchedTask) {
          setTask(fetchedTask);
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const getTimeLeft = (deadline: Date | string): string => {
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} days`;
  };

  const handleSuccess = async () => {
    console.log("Registration successful");
    // Optionally refetch registration status here if needed
  };

  const statusColor = {
    Open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Judging:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    Closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">Task not found</h3>
        <p className="text-muted-foreground">
          The requested task could not be found.
        </p>
      </div>
    );
  }

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
              Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Not set'}
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
      <SelfQRModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        selfApp={selfApp}
        onSuccess={handleSuccess}
        title="Register for Task"
        description="Scan to verify and register for this task"
      />

      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions
            <Badge variant="secondary" className="ml-2">
              {Array.isArray(task.submissions) ? task.submissions.length : (task.submissions || 0)}
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
                  {Array.isArray(task.criteria) &&
                    task.criteria.map((criterion, index) => (
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
                    <span className="text-xl font-mono">
                      {task.amount} {task.tokenAddress === "0x0" ? "ETH" : task.tokenAddress}
                    </span>
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
                    <span className="font-mono text-sm">{task.createdBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Not available'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Left</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.deadline ? getTimeLeft(task.deadline) : 'No deadline'}
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
                          <span className="font-mono">{task.styleCommit}</span>
                        </p>
                        <p className="text-sm">
                          Salt:{" "}
                          <span className="font-mono">
                            {task.salt || "N/A"}
                          </span>
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
          {Array.isArray(task.submissions) && task.submissions.length > 0 ? (
            <div className="space-y-4">
              {task.submissions.map((submission, index) => (
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
                          {submission.id.slice(0, 6)}...
                          {submission.id.slice(-4)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {submission.score
                          ? `Score: ${submission.score}`
                          : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {submission.content || "No content provided"}
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
