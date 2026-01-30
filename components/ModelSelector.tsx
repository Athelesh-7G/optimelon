"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Provider } from "@/lib/storage"

interface ModelSelectorProps {
  provider: Provider
  model: string
  onProviderChange: (provider: Provider) => void
  onModelChange: (model: string) => void
}

const PROVIDERS: { value: Provider; label: string; placeholder: string }[] = [
  { value: "bytez", label: "Bytez", placeholder: "e.g., Qwen/Qwen3-8B" },
  { value: "openai", label: "OpenAI", placeholder: "e.g., gpt-4o" },
  { value: "claude", label: "Claude", placeholder: "e.g., claude-3-5-sonnet-20241022" },
  { value: "gemini", label: "Gemini", placeholder: "e.g., gemini-1.5-pro" },
  { value: "moonshot", label: "Moonshot", placeholder: "e.g., moonshot-v1-8k" },
  { value: "deepseek", label: "DeepSeek", placeholder: "e.g., deepseek-chat" },
  { value: "groq", label: "Groq", placeholder: "e.g., llama-3.3-70b-versatile" },
  { value: "together", label: "Together AI", placeholder: "e.g., meta-llama/Llama-3-70b-chat-hf" },
]

const DEFAULT_MODELS: Record<Provider, string> = {
  bytez: "Qwen/Qwen3-8B",
  openai: "gpt-4o",
  claude: "claude-3-5-sonnet-20241022",
  gemini: "gemini-1.5-pro",
  moonshot: "moonshot-v1-8k",
  deepseek: "deepseek-chat",
  groq: "llama-3.3-70b-versatile",
  together: "meta-llama/Llama-3-70b-chat-hf",
}

export function ModelSelector({
  provider,
  model,
  onProviderChange,
  onModelChange,
}: ModelSelectorProps) {
  const currentProvider = PROVIDERS.find((p) => p.value === provider)

  const handleProviderChange = (newProvider: Provider) => {
    onProviderChange(newProvider)
    // Set default model for the new provider
    onModelChange(DEFAULT_MODELS[newProvider])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="provider">Provider</Label>
        <Select value={provider} onValueChange={(v) => handleProviderChange(v as Provider)}>
          <SelectTrigger id="provider" className="bg-card">
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            {PROVIDERS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          placeholder={currentProvider?.placeholder}
          className="font-mono text-sm bg-card"
        />
      </div>
    </div>
  )
}
