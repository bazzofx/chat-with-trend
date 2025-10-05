"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Send, Shield, Trash2, Loader2, Sparkles,Crosshair,Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { ParticlesBackground } from "@/components/particles-background"
import { ThemeToggle } from "@/components/theme-toggle"
import { MarkdownRenderer } from "@/components/markdown-renderer"

export default function ChatPage() {
  const [input, setInput] = useState("")

  const { messages, sendMessage, status, reload } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status === "in_progress") return

    sendMessage({ text: input })
    setInput("")
  }

  const handleNewChat = () => {
    window.location.reload()
  }

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      <ParticlesBackground />

      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none z-0" />

      {/* Header */}
      <header className="border-b border-border glass-effect relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary glow-effect float-effect">
              <Crosshair className="w-6 h-6 text-primary-foreground" />
              {/* <img src="https://cybersamurai.co.uk/assets/images/trend_logo.png" alt="Trend Logo" /> */}
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">XDR Search Builder</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Threat Hunting Companion for Trend Micro by CyberSamurai.co.uk
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              className="gap-2 bg-transparent hover:bg-primary/10 transition-all"
            >
              <Crosshair className="w-4 h-4" />
              Start New Threat Hunt
            </Button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 glow-effect float-effect">
                {/* <Shield className="w-10 h-10 text-primary" /> */}
                <img src="https://cybersamurai.co.uk/assets/images/trend_logo.png" alt="" className="Trend Logo" />
              </div>
              <h2 className="text-3xl font-bold gradient-text mb-3">Threat Hunter Companion</h2>
              <p className="text-muted-foreground max-w-md leading-relaxed">
                Describe what threat you are hunting and I will try my best to provide some context on how to search for it using VisionOne
              </p>
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                  IOC Detection
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                  Search Syntax
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                  Playbook Ideas
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary flex-shrink-0 glow-effect">
                      <Shield className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-4 py-3 max-w-[80%] transition-all hover:scale-[1.02] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "glass-effect text-foreground"
                    }`}
                  >
                    {message.parts.map((part, partIndex) => {
                      if (part.type === "text") {
                        return message.role === "assistant" ? (
                          <MarkdownRenderer key={partIndex} content={part.text} />
                        ) : (
                          <div key={partIndex} className="whitespace-pre-wrap text-sm leading-relaxed">
                            {part.text}
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                  {message.role === "user" && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary flex-shrink-0">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/60" />
                    </div>
                  )}
                </div>
              ))}
              {status === "in_progress" && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-4 justify-start animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary flex-shrink-0 glow-effect">
                    <Shield className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="rounded-lg px-4 py-3 glass-effect">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border glass-effect relative z-10">
        <div className="container mx-auto px-4 py-4 max-w-4xl ">
          <form onSubmit={handleSubmit} className="flex gap-3 ">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe endpoint activity or paste threat data..."
              className="min-h-[60px] max-h-[200px] resize-none bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              disabled={status === "in_progress"}
            />
            <Button
              type="submit"
              size="icon"
              className="h-[60px] w-[60px] flex-shrink-0 glow-effect hover:scale-105 transition-all"
              disabled={!input.trim() || status === "in_progress"}
            >
              {status === "in_progress" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Designed by <a href="https://cybersamurai.co.uk">CyberSamurai.co.uk</a> 
          </p>
        </div>
      </div>
    </div>
  )
}
