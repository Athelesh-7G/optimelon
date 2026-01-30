/**
 * OptiMelon Intelligent System Prompt Builder
 * 
 * This module dynamically constructs system prompts based on user intent.
 * It preserves full model capability without enforcing hard rules or bans.
 */

// Base system prompt - always included verbatim
const BASE_SYSTEM_PROMPT = `You are OptiMelon, a high-signal assistant designed to adapt your responses to the user's intent.
Your goal is clarity, precision, and usefulness.
Preserve the model's full reasoning ability.
Prefer signal over noise.
Adapt your communication style to how the user is asking for help.`

/**
 * Infer user intent from the latest message using lightweight string heuristics.
 * Returns a short sentence modifier to append to the base prompt.
 */
function inferIntentModifier(latestUserMessage: string): string {
  const msg = latestUserMessage.toLowerCase()

  // Fast recall / revision / exam signals
  if (/\b(revise|quick|test|exam|recap|refresh|summary|tldr|brief|fast|short)\b/.test(msg)) {
    return "Success means the user can recall and apply this immediately with minimal reading."
  }

  // Code-first / debugging / implementation signals
  if (
    /\b(bug|fix|optimize|error|debug|refactor|implement|code|function|class|method|compile|syntax|runtime|exception|stack trace)\b/.test(msg) ||
    /```[\s\S]*```/.test(latestUserMessage) ||
    /\b(\.js|\.ts|\.py|\.java|\.cpp|\.go|\.rs|\.rb|\.php)\b/.test(msg)
  ) {
    return "Success means the user can apply the solution directly with minimal explanation overhead."
  }

  // Design / comparison / tradeoff signals
  if (/\b(design|architecture|compare|versus|vs|tradeoff|trade-off|pros and cons|evaluate|assess|structure|organize|plan)\b/.test(msg)) {
    return "Success means the user can make a clear decision based on tradeoffs."
  }

  // Explanatory / conceptual signals
  if (/\b(explain|why|how does|how do|what is|what are|understand|concept|theory|meaning|reason|cause)\b/.test(msg)) {
    return "Success means the user understands the reasoning, not just the final answer."
  }

  // Step-by-step / tutorial signals
  if (/\b(step by step|steps|walkthrough|tutorial|guide|how to|show me how)\b/.test(msg)) {
    return "Success means the user can follow and complete the process independently."
  }

  // Creative / brainstorming signals
  if (/\b(ideas|brainstorm|creative|suggest|possibilities|alternatives|options|what if)\b/.test(msg)) {
    return "Success means the user has actionable options to explore further."
  }

  // Direct answer signals
  if (/\b(just tell me|answer|what's the|give me|need to know)\b/.test(msg)) {
    return "Success means the user gets the answer without navigating through elaboration."
  }

  // No specific intent detected - return empty (base prompt is sufficient)
  return ""
}

/**
 * Build the final system prompt by combining the base prompt with an intent modifier.
 * This function analyzes the conversation and returns a single system prompt string.
 */
export function buildSystemPrompt(messages: { role: string; content: string }[]): string {
  // Find the latest user message
  const latestUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user")

  if (!latestUserMessage) {
    return BASE_SYSTEM_PROMPT
  }

  const intentModifier = inferIntentModifier(latestUserMessage.content)

  if (intentModifier) {
    return `${BASE_SYSTEM_PROMPT}\n\n${intentModifier}`
  }

  return BASE_SYSTEM_PROMPT
}

/**
 * Build messages array with intelligent system prompt injection.
 * If customSystemPrompt is provided, it takes priority.
 * Otherwise, use the intelligent intent-aware system prompt.
 */
export function buildMessages(
  customSystemPrompt: string | null,
  conversationMessages: Array<{ role: "system" | "user" | "assistant"; content: string }>
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = []

  let systemPrompt: string

  if (customSystemPrompt && customSystemPrompt.trim()) {
    // User provided a custom system prompt - use it
    systemPrompt = customSystemPrompt
  } else {
    // Use intelligent intent-aware system prompt
    systemPrompt = buildSystemPrompt(conversationMessages)
  }

  // Inject system prompt as the FIRST message
  messages.push({ role: "system", content: systemPrompt })

  // Preserve all conversation messages (filter out any existing system messages to avoid duplicates)
  const nonSystemMessages = conversationMessages.filter((m) => m.role !== "system")
  messages.push(...nonSystemMessages)

  // If there were user-supplied system messages in the conversation, add them after our injected one
  const userSystemMessages = conversationMessages.filter((m) => m.role === "system")
  if (userSystemMessages.length > 0) {
    // Insert user system messages right after our base system prompt
    messages.splice(1, 0, ...userSystemMessages)
  }

  return messages
}

// Export the base prompt for reference
export const DEFAULT_SYSTEM_PROMPT = BASE_SYSTEM_PROMPT
