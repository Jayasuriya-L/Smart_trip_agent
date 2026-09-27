"use client";

import { useState, useCallback, useRef } from "react";
import { ChatMessage, Itinerary } from "@/types";
import { chatApi } from "@/lib/api";
import { MOCK_ITINERARY, MOCK_WELCOME_MESSAGES } from "@/lib/mockData";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const USE_MOCK = process.env.NEXT_PUBLIC_API_URL === undefined;

export function useChat(sessionId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "assistant",
      content: MOCK_WELCOME_MESSAGES[0],
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
        let responseContent = "";
        let itinerary: Itinerary | undefined;

        if (USE_MOCK || !process.env.NEXT_PUBLIC_API_URL) {
          // ── Mock response ──────────────────────────────────────
          await new Promise((r) => setTimeout(r, 2000));
          responseContent =
            "I've researched **Ooty** thoroughly and prepared your personalized 3-day itinerary! 🏔️\n\nThis plan fits within your ₹10,000 budget for 2 travelers, covering must-see attractions, comfortable accommodation, local cuisine, and the iconic Nilgiri Mountain Railway.\n\n> ⚠️ Prices are estimates and may vary. Always verify locally.";
          itinerary = MOCK_ITINERARY;
        } else {
          // ── Real API call ──────────────────────────────────────
          abortRef.current = new AbortController();
          const data = await chatApi.sendMessage({
            message: text,
            session_id: sessionId,
          });
          responseContent = data.message;
          itinerary = data.itinerary;
        }

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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        setMessages((prev) => prev.filter((m) => m.id !== loadingId));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId]
  );

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: uid(),
        role: "assistant",
        content: MOCK_WELCOME_MESSAGES[0],
        timestamp: new Date(),
      },
    ]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages };
}
