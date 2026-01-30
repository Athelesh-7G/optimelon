"use client"

import React from "react"
import { Plus, Home, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

interface Chat {
  id: string
  title: string
  updatedAt: number
}

interface SidebarProps {
  chats: Chat[]
  currentChatId: string | null
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  onOpenSettings: () => void
}

export function Sidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onOpenSettings,
}: SidebarProps) {
  return (
    <aside
      className="w-[280px] h-screen flex-shrink-0 flex flex-col border-r glass-card"
      style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b" style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg melon-gradient flex items-center justify-center"
            style={{ boxShadow: "0 2px 8px rgba(255, 107, 107, 0.3)" }}
          >
            <span className="text-base" role="img" aria-label="watermelon">
              🍉
            </span>
          </div>
          <div>
            <h2 className="font-bold text-sm melon-gradient bg-clip-text text-transparent">
              OptiMelon
            </h2>
            <div
              className="flex items-center gap-1 text-xs"
              style={{ color: "rgba(255, 255, 255, 0.45)" }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full bg-green-600"
                style={{ boxShadow: "0 0 4px rgba(16, 185, 129, 0.5)" }}
              />
              <span>Online</span>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <Button
          onClick={onNewChat}
          className="w-full melon-gradient hover:opacity-90 transition-all duration-200 shadow-md"
          style={{ boxShadow: "0 2px 8px rgba(255, 107, 107, 0.2)" }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <nav className="flex-1 overflow-y-auto scrollbar-melon p-2">
        <div className="space-y-1">
          {chats.length === 0 ? (
            <div
              className="text-center py-8 px-4"
              style={{ color: "rgba(255, 255, 255, 0.45)" }}
            >
              <p className="text-sm">No chat history yet</p>
              <p className="text-xs mt-1">Start a new conversation</p>
            </div>
          ) : (
            chats.map((chat) => {
              const isActive = chat.id === currentChatId
              return (
                <div
                  key={chat.id}
                  className={`group relative rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                    isActive ? "border-l-2" : ""
                  }`}
                  style={
                    isActive
                      ? {
                          background: "rgba(255, 107, 107, 0.1)",
                          borderColor: "var(--melon-red)",
                        }
                      : {
                          background: "transparent",
                        }
                  }
                  onClick={() => onSelectChat(chat.id)}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.03)"
                      e.currentTarget.style.transform = "translateX(4px)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent"
                      e.currentTarget.style.transform = "translateX(0)"
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-sm font-medium truncate"
                        style={{
                          color: isActive
                            ? "rgba(255, 255, 255, 0.95)"
                            : "rgba(255, 255, 255, 0.85)",
                        }}
                      >
                        {chat.title}
                      </h4>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "rgba(255, 255, 255, 0.45)" }}
                      >
                        {formatDistanceToNow(chat.updatedAt, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteChat(chat.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 transition-all duration-200"
                      aria-label="Delete chat"
                    >
                      <Trash2
                        className="h-3.5 w-3.5"
                        style={{ color: "var(--melon-red)" }}
                      />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div
        className="p-3 border-t space-y-2"
        style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        <Button
          onClick={onOpenSettings}
          variant="ghost"
          className="w-full justify-start hover:bg-white/5 transition-colors"
          style={{ color: "rgba(255, 255, 255, 0.7)" }}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-white/5 transition-colors"
          style={{ color: "rgba(255, 255, 255, 0.7)" }}
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
      </div>
    </aside>
  )
}
