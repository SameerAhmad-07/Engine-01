import { PrismaClient } from "@prisma/client";
import { defaultAgents } from "../lib/platform/agents";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@virality.local" },
    update: {},
    create: { email: "demo@virality.local", name: "Demo User" },
  });

  for (const agent of defaultAgents()) {
    await prisma.agent.upsert({
      where: { id: agent.id },
      update: {},
      create: {
        id: agent.id,
        userId: user.id,
        name: agent.name,
        kind: agent.role,
        description: agent.description,
        provider: "custom",
        model: agent.model,
        enabled: agent.status !== "offline",
        systemPrompt: agent.systemPrompt,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
