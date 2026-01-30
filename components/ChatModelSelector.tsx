"use client"

import { useState } from "react"
import { ChevronDown, Info, Cpu, Sparkles, Code, FileText, Brain } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ModelSpecsDialog } from "./ModelSpecsDialog"
import { AVAILABLE_MODELS, getModelById, type ModelInfo } from "@/lib/models"

interface ChatModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
}

// Icon mapping for different model types
function getModelIcon(model: ModelInfo) {
  const tags = model.tags.map((t) => t.toLowerCase())
  if (tags.includes("coding") || tags.includes("code")) {
    return <Code className="h-3.5 w-3.5" />
  }
  if (tags.includes("reasoning") || tags.includes("research")) {
    return <Brain className="h-3.5 w-3.5" />
  }
  if (tags.includes("document analysis") || tags.includes("long context")) {
    return <FileText className="h-3.5 w-3.5" />
  }
  return <Sparkles className="h-3.5 w-3.5" />
}

export function ChatModelSelector({
  selectedModel,
  onModelChange,
}: ChatModelSelectorProps) {
  const [specsOpen, setSpecsOpen] = useState(false)
  const [selectedModelForSpecs, setSelectedModelForSpecs] =
    useState<ModelInfo | null>(null)

  const currentModel = getModelById(selectedModel)

  const handleOpenSpecs = (e: React.MouseEvent, modelId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const model = getModelById(modelId)
    if (model) {
      setSelectedModelForSpecs(model)
      setSpecsOpen(true)
    }
  }

  return (
    <>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger
          className="h-8 px-2.5 gap-1.5 text-xs font-medium rounded-lg border transition-all duration-200 w-auto min-w-0"
          style={{
            background: "rgba(26, 26, 31, 0.6)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            color: "rgba(255, 255, 255, 0.85)",
          }}
        >
          <Cpu className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--melon-coral)" }} />
          <SelectValue placeholder="Select model">
            <span className="truncate max-w-[120px] sm:max-w-[180px]">
              {currentModel?.name || selectedModel.split("/").pop()}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          className="max-h-[400px] overflow-y-auto glass-card"
          style={{
            background: "rgba(26, 26, 31, 0.95)",
            borderColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          {AVAILABLE_MODELS.map((model) => (
            <SelectItem
              key={model.id}
              value={model.id}
              className="py-2.5 px-2 cursor-pointer rounded-md transition-colors group"
            >
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: "rgba(255, 107, 107, 0.12)" }}
                  >
                    {getModelIcon(model)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: "rgba(255, 255, 255, 0.9)" }}
                    >
                      {model.name}
                    </div>
                    <div
                      className="text-[10px] truncate"
                      style={{ color: "rgba(255, 255, 255, 0.5)" }}
                    >
                      {model.contextLength} context
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleOpenSpecs(e, model.id)}
                  style={{ color: "var(--melon-green)" }}
                  title="View specs"
                >
                  <Info className="h-3.5 w-3.5" />
                </Button>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ModelSpecsDialog
        model={selectedModelForSpecs}
        open={specsOpen}
        onOpenChange={setSpecsOpen}
      />
    </>
  )
}
