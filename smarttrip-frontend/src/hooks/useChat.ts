"use client";

import { useState, useCallback, useRef } from "react";
import { ChatMessage, Itinerary } from "@/types";
import { chatApi } from "@/lib/api";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const DEFAULT_WELCOME: string =
  "Hello! I am your SmartTrip AI travel agent. Where would you like to travel, and what kind of trip are you planning? Tell me your destination, travel dates, group size, and budget to get started.";

export function useChat(
  sessionId: string,
  onMessageSent?: () => void,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "assistant",
      content: DEFAULT_WELCOME,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setError(null);

      // Add user message
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      // Add placeholder loading message
      const loadingId = uid();
      const loadingMsg: ChatMessage = {
        id: loadingId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setIsLoading(true);

      try {
        abortRef.current = new AbortController();
        const data = await chatApi.sendMessage({
          message: text,
          session_id: sessionId,
        });

        const responseContent = data.message;
        const itinerary: Itinerary | undefined = data.itinerary;

        // Replace loading message with real response
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId
              ? {
                  ...m,
                  content: responseContent,
                  itinerary,
                  isLoading: false,
                  timestamp: new Date(),
                }
              : m
          )
        );

        if (onMessageSent) {
          onMessageSent();
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        setMessages((prev) => prev.filter((m) => m.id !== loadingId));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId, onMessageSent]
  );

  const loadSession = useCallback(async (sid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const rawMsgs = await chatApi.getSessionMessages(sid);
      if (rawMsgs && rawMsgs.length > 0) {
        const parsed: ChatMessage[] = rawMsgs.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at),
          itinerary: m.itinerary,
          isLoading: false,
        }));
        setMessages(parsed);
      } else {
        setMessages([
          {
            id: uid(),
            role: "assistant",
            content: DEFAULT_WELCOME,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load session history";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: uid(),
        role: "assistant",
        content: DEFAULT_WELCOME,
        timestamp: new Date(),
      },
    ]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages, loadSession };
}
