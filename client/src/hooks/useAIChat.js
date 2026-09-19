import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useVillageSelection } from "./useVillageSelection";
import { API_BASE_URL } from "../services/api";

export const useAIChat = (villageId, year) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(null);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();
  const { activeLayers, clickedLocation } = useVillageSelection();

  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [villageId]);

  const sendMessage = useCallback(
    async (question) => {
      if (!villageId || !question.trim()) return;

      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: question.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const payload = {
          question: userMessage.content,
          language: i18n.language || "en",
          history: messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
          })),
          mapState: { visibleLayers: activeLayers },
          clickedLocation: clickedLocation,
        };

        const response = await fetch(
          `${API_BASE_URL}/api/v1/ai/${villageId}/chat?year=${year}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        if (!response.body) throw new Error("No readable stream");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.status === "completed") {
                const aiMessage = {
                  id: (Date.now() + 1).toString(),
                  role: "ai",
                  content: data.answer,
                  structuredData: data.structured_data,
                  followUpQuestions: data.follow_up_questions,
                };
                setMessages((prev) => [...prev, aiMessage]);
                setLoadingStatus(null);
              } else {
                setLoadingStatus(data.status);
              }
            } catch (e) {
              console.error("Failed to parse stream chunk", line, e);
            }
          }
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to get response from AI.";
        setError(errorMsg);
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content:
            "I encountered an error analyzing the data. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setLoadingStatus(null);
      }
    },
    [villageId, year, messages, activeLayers, clickedLocation, i18n.language],
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    loadingStatus,
    error,
    sendMessage,
    clearConversation,
  };
};
