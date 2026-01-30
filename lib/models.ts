export interface ModelInfo {
  id: string
  name: string
  provider: string
  contextLength: string
  description: string
  bestFor: string[]
  tags: string[]
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: "Qwen/Qwen3-Next-80B-A3B-Instruct",
    name: "Qwen3-Next-80B",
    provider: "bytez",
    contextLength: "262K (up to 1M with YaRN)",
    description: "Best for ultra-long context tasks, complex reasoning, code generation, and multilingual use cases. Excels at agentic workflows, tool calling, and extended conversations.",
    bestFor: [
      "Ultra-long context tasks",
      "Complex reasoning",
      "Code generation",
      "Multilingual use cases",
      "Agentic workflows",
      "Tool calling",
      "Extended conversations"
    ],
    tags: ["Long Context", "Reasoning", "Code", "Multilingual"]
  },
  {
    id: "Qwen/Qwen3-Coder-480B-A35B-Instruct",
    name: "Qwen3-Coder-480B",
    provider: "bytez",
    contextLength: "256K",
    description: "Ideal for advanced coding tasks, repository-scale refactoring, autonomous software engineering, and enterprise integration. Handles complex debugging and code completion.",
    bestFor: [
      "Advanced coding tasks",
      "Repository-scale refactoring",
      "Autonomous software engineering",
      "Enterprise integration",
      "Complex debugging",
      "Code completion"
    ],
    tags: ["Coding", "Enterprise", "Debugging", "Refactoring"]
  },
  {
    id: "zai-org/GLM-4.5-Air",
    name: "GLM-4.5-Air",
    provider: "bytez",
    contextLength: "128K",
    description: "Perfect for cost-effective, high-volume conversational AI, lightweight coding, and efficient agentic workflows. Suited for scalable deployments and resource-conscious environments.",
    bestFor: [
      "Cost-effective deployments",
      "High-volume conversational AI",
      "Lightweight coding",
      "Efficient agentic workflows",
      "Scalable deployments",
      "Resource-conscious environments"
    ],
    tags: ["Cost-Effective", "Scalable", "Conversational", "Efficient"]
  },
  {
    id: "deepseek-ai/DeepSeek-V3.2-Exp",
    name: "DeepSeek-V3.2-Exp",
    provider: "bytez",
    contextLength: "128K",
    description: "Excels at long-context processing, document analysis, code generation, and advanced reasoning. Strong in legal, research, and multi-step logical tasks.",
    bestFor: [
      "Long-context processing",
      "Document analysis",
      "Code generation",
      "Advanced reasoning",
      "Legal tasks",
      "Research applications",
      "Multi-step logical tasks"
    ],
    tags: ["Document Analysis", "Legal", "Research", "Reasoning"]
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "bytez",
    contextLength: "1M",
    description: "Best for enhanced reasoning, data analysis, strategic planning, and creative visualizations. Suitable for complex logic and strategic decision-making.",
    bestFor: [
      "Enhanced reasoning",
      "Data analysis",
      "Strategic planning",
      "Creative visualizations",
      "Complex logic",
      "Strategic decision-making"
    ],
    tags: ["Reasoning", "Data Analysis", "Strategic", "Creative"]
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    name: "Llama 3.3 70B",
    provider: "bytez",
    contextLength: "128K",
    description: "Superior for coding, general knowledge, tool use, and multilingual support. Offers improved code feedback and error handling.",
    bestFor: [
      "Coding assistance",
      "General knowledge",
      "Tool use",
      "Multilingual support",
      "Code feedback",
      "Error handling"
    ],
    tags: ["Coding", "General Purpose", "Multilingual", "Tools"]
  },
  {
    id: "moonshotai/Kimi-K2-Instruct",
    name: "Kimi K2",
    provider: "bytez",
    contextLength: "256K",
    description: "Designed for autonomous problem-solving, coding, debugging, and research. Excels in agentic workflows and tool integration.",
    bestFor: [
      "Autonomous problem-solving",
      "Coding",
      "Debugging",
      "Research",
      "Agentic workflows",
      "Tool integration"
    ],
    tags: ["Autonomous", "Debugging", "Research", "Agentic"]
  },
  {
    id: "Qwen/Qwen2.5-7B-Instruct",
    name: "Qwen 2.5 7B",
    provider: "bytez",
    contextLength: "128K",
    description: "Strong in instruction following, structured data understanding, code and math reasoning, and long-text generation.",
    bestFor: [
      "Instruction following",
      "Structured data understanding",
      "Code reasoning",
      "Math reasoning",
      "Long-text generation"
    ],
    tags: ["Instruction Following", "Math", "Structured Data", "Fast"]
  },
  {
    id: "Qwen/Qwen2.5-Coder-7B-Instruct",
    name: "Qwen 2.5 Coder 7B",
    provider: "bytez",
    contextLength: "128K",
    description: "Ideal for code generation, reasoning, and fixing, with long-context support. Efficient for complex coding tasks with smaller footprint.",
    bestFor: [
      "Code generation",
      "Code reasoning",
      "Bug fixing",
      "Long-context coding",
      "Efficient inference"
    ],
    tags: ["Coding", "Efficient", "Bug Fixing", "Fast"]
  },
  {
    id: "zai-org/GLM-4-32B-0414",
    name: "GLM-4 32B",
    provider: "bytez",
    contextLength: "128K",
    description: "Excellent for complex business tasks, tool use, online search, code-related intelligent tasks, and financial data analysis. Comparable to much larger models in benchmark performance.",
    bestFor: [
      "Complex business tasks",
      "Tool use",
      "Online search",
      "Code-related intelligent tasks",
      "Financial data analysis"
    ],
    tags: ["Business", "Financial", "Tools", "Search"]
  }
]

export const DEFAULT_MODEL_ID = "Qwen/Qwen3-Next-80B-A3B-Instruct"

export function getModelById(id: string): ModelInfo | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id)
}

export function getModelDisplayName(id: string): string {
  const model = getModelById(id)
  return model?.name || id.split("/").pop() || id
}
