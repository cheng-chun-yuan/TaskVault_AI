import TaskPageClient from "@/components/task/taskclient"

export default async function TaskPage({ params }:{params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskPageClient taskId={id} />
}
