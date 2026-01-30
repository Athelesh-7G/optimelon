"use client"

import React, { useState } from "react"
import { Plus, Home, Settings, Trash2, Menu, X } from "lucide-react"
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
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass-card border-border"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-[240px] h-screen flex-shrink-0 flex flex-col border-r glass-card border-border relative z-40
          transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          fixed md:relative
        `}
      >
      {/* Sidebar Header */}
      <div className="p-3 border-b border-border">
        {/* New Chat Button */}
        <Button
          onClick={() => {
            onNewChat()
            setIsMobileOpen(false)
          }}
          className="w-full melon-gradient hover:opacity-90 transition-all duration-200 text-sm shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <nav className="flex-1 overflow-y-auto scrollbar-melon p-1.5">
        <div className="space-y-0.5">
          {chats.length === 0 ? (
            <div className="text-center py-6 px-3 text-muted-foreground">
              <p className="text-xs">No history</p>
            </div>
          ) : (
            chats.map((chat) => {
              const isActive = chat.id === currentChatId
              return (
                <div
                  key={chat.id}
                  className={`group relative rounded-md p-2 cursor-pointer transition-all duration-150 ${
                    isActive ? "border-l-2 bg-primary/10 border-primary/60" : "hover:bg-secondary/30"
                  }`}
                  onClick={() => {
                    onSelectChat(chat.id)
                    setIsMobileOpen(false)
                  }}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-medium truncate ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {chat.title}
                      </h4>
                      <p className="text-[10px] mt-0.5 text-muted-foreground/60">
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
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/20 transition-opacity"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-2 border-t border-border space-y-1">
        <Button
          onClick={() => {
            onNewChat()
            setIsMobileOpen(false)
          }}
          variant="ghost"
          className="w-full justify-start hover:bg-secondary/50 transition-colors text-xs text-muted-foreground"
        >
          <Home className="h-3.5 w-3.5 mr-2" />
          New Conversation
        </Button>
        <Button
          onClick={() => {
            onOpenSettings()
            setIsMobileOpen(false)
          }}
          variant="ghost"
          className="w-full justify-start hover:bg-secondary/50 transition-colors text-xs text-muted-foreground"
        >
          <Settings className="h-3.5 w-3.5 mr-2" />
          Settings
        </Button>
      </div>
    </aside>
    </>
  )
  )
}
