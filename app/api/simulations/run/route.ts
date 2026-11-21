import type {
  ContentProfile, AudienceConfig, SimulationConfig, VideoAsset } from "@/types";
import { SimulationEngine } from "@/lib/simulation/engine";
import { PersonaAgentRuntime } from "@/lib/agents/agent-runtime";
import { readLLMConfig } from "@/lib/llm";
import { auditLog } from "@/lib/platform/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface Body {
  audience: AudienceConfig;
  config: SimulationConfig;
  video: VideoAsset | null;
  contentProfile?: ContentProfile | null;
  simulationId?: string;
}

/**
 * Server-side AI simulation run. LLM calls happen here so the provider key is
 * never exposed to the browser. Progress is streamed to the client as SSE.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const encoder = new TextEncoder();
  const llmConfig = readLLMConfig();
  const maxCalls = Math.min(body.config.maxLlmCalls, llmConfig.maxCallsPerRun);

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        auditLog({
          action: "simulation.run",
          resource: body.simulationId ?? "draft",
          detail: `AI mode · provider=${llmConfig.provider} · maxCalls=${maxCalls}`,
        });

        const runtime = new PersonaAgentRuntime({
          config: llmConfig,
          maxCalls,
          onProgress: (p) => send("agent", p),
        });

        const engine = new SimulationEngine();
        const output = await engine.simulate(
          {
            audience: body.audience,
            config: body.config,
            video: body.video,
            contentProfile: body.contentProfile ?? null,
            agentRuntime: runtime,
          },
          (phase) => {
            send("phase", phase);
          },
        );

        send("result", output);
        auditLog({
          action: "simulation.complete",
          resource: body.simulationId ?? "draft",
          detail: `verdict=${output.verdict.label} · calls=${output.agentRun?.llmCalls ?? 0} · fallbacks=${output.agentRun?.fallbacks ?? 0}`,
        });
      } catch (err) {
        send("error", {
          message: err instanceof Error ? err.message : "Simulation failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
