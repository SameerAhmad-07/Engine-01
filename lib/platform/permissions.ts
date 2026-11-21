import type { ToolName, ToolPermission } from "@/types";

/**
 * Approval gates. Agents never perform external or destructive actions
 * automatically — those require explicit human approval, and some are blocked
 * outright unless authorised.
 */
export const TOOL_PERMISSIONS: Record<ToolName, ToolPermission> = {
  analyze_video: "safe",
  create_audience: "safe",
  generate_personas: "safe",
  run_simulation: "safe",
  inspect_persona: "safe",
  compare_simulations: "safe",
  generate_report: "safe",
  create_ticket: "safe",
  update_ticket: "safe",
  search_knowledge: "safe",
  send_message: "requires_approval",
};

/** Named external actions the platform recognises but does not implement in Phase 3. */
export const EXTERNAL_ACTIONS: Record<string, ToolPermission> = {
  post_to_social_media: "requires_approval",
  send_external_message: "requires_approval",
  delete_data: "blocked",
  export_audience: "requires_approval",
};

export function permissionFor(tool: ToolName): ToolPermission {
  return TOOL_PERMISSIONS[tool] ?? "requires_approval";
}

export const PERMISSION_LABEL: Record<ToolPermission, string> = {
  safe: "Safe",
  requires_approval: "Requires approval",
  blocked: "Blocked",
};
