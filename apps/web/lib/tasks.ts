import prisma from "@/lib/prisma";

export async function getAllTasks() {
  const dbTasks = await prisma.task.findMany(); // or however you're querying tasks
  const mockTasks = [
    {
      id: "10",
      title: "Create a Landing Page for DeFi Protocol",
      description: "Design and implement a responsive landing page for our new DeFi protocol.",
      deadline: "April 15, 2025",
      timeLeft: "14 days left",
      reward: "2 ETH",
      status: "Open",
      submissions: 3,
    },
    {
      id: "11",
      title: "Design a Logo for Web3 Project",
      description: "Create a modern, professional logo for our Web3 project that represents decentralization and security.",
      deadline: "April 15, 2025",
      timeLeft: "2 days left",
      reward: "0.5 ETH",
      status: "Open",
      submissions: 5,
    },
    {
      id: "12",
      title: "Smart Contract Security Audit",
      description: "Perform a comprehensive security audit of our DeFi protocol smart contracts and provide a detailed report.",
      deadline: "April 20, 2025",
      timeLeft: "5 days left",
      reward: "2 ETH",
      status: "Open",
      submissions: 2,
    },
    {
      id: "13",
      title: "Create Marketing Strategy",
      description: "Develop a comprehensive marketing strategy for our NFT marketplace launch, including social media and community engagement.",
      deadline: "April 5, 2025",
      timeLeft: "Ended",
      reward: "1 ETH",
      status: "Judging",
      submissions: 8,
    },
    {
      id: "14",
      title: "Develop API Integration",
      description: "Create an integration between our platform and a popular third-party API for enhanced functionality.",
      deadline: "April 3, 2025",
      timeLeft: "Ended",
      reward: "1.5 ETH",
      status: "Closed",
      submissions: 6,
    },
  ];
  const tasks = [...dbTasks, ...mockTasks];
  return tasks;
}

export async function getTaskById(id: string) {
  const task = await prisma.task.findUnique({ where: { taskId: id } });
  if (!task) {
    // If no task found in DB, check mock tasks
    const mockTasks = [
      {
        id: "10",
        title: "Create a Landing Page for DeFi Protocol",
        description: "Design and implement a responsive landing page for our new DeFi protocol.",
        deadline: "April 15, 2025",
        criteria: ["Responsiveness", "Design", "SEO"],
        timeLeft: "14 days left",
        amount: 2,
        tokenAddress: "0x0",
        status: "Open",
        submissions: 3,
      },
      {
        id: "11",
        title: "Design a Logo for Web3 Project",
        description: "Create a modern, professional logo for our Web3 project that represents decentralization and security.",
        deadline: "April 15, 2025",
        criteria: ["Responsiveness", "Design", "SEO"],
        timeLeft: "2 days left",
        amount: 0.5,
        tokenAddress: "0x0",
        status: "Open",
        submissions: 5,
      },
      {
        id: "12",
        title: "Smart Contract Security Audit",
        description: "Perform a comprehensive security audit of our DeFi protocol smart contracts and provide a detailed report.",
        deadline: "April 20, 2025",
        criteria: ["Responsiveness", "Design", "SEO"],
        timeLeft: "5 days left",
        amount: 1500,
        tokenAddress: "0x0",
        status: "Open",
        submissions: 2,
      },
      {
        id: "13",
        title: "Create Marketing Strategy",
        description: "Develop a comprehensive marketing strategy for our NFT marketplace launch, including social media and community engagement.",
        deadline: "April 5, 2025",
        criteria: ["Responsiveness", "Design", "SEO"],
        timeLeft: "Ended",
        amount: 200,
        tokenAddress: "0x0",
        status: "Judging",
        submissions: 8,
      },
      {
        id: "14",
        title: "Develop API Integration",
        description: "Create an integration between our platform and a popular third-party API for enhanced functionality.",
        deadline: "April 3, 2025",
        criteria: ["Responsiveness", "Design", "SEO"],
        timeLeft: "Ended",
        amount: 1500,
        tokenAddress: "0x0",
        status: "Closed",
        submissions: 6,
      },
    ]
    const mockTask = mockTasks.find(t => t.id === id)
    return mockTask;
  }
  return task;
}

