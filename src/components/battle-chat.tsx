"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface ChatMessage {
  id: string;
  room_code: string;
  sender_id: string;
  sender_name: string;
  message: string;
  created_at: string;
}

interface BattleChatProps {
  roomCode: string;
  currentUserId: string;
  currentUserName: string;
  isHost?: boolean;
}

export default function BattleChat({
  roomCode,
  currentUserId,
  currentUserName,
  isHost = false,
}: BattleChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 1. Fetch initial message history from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        const { data, error } = await supabase
          .from("room_messages")
          .select("*")
          .eq("room_code", roomCode)
          .order("created_at", { ascending: true })
          .limit(50);

        if (!error && data && isMounted) {
          setMessages(data as ChatMessage[]);
        }
      } catch (err) {
        console.error("Failed to load battle chat history:", err);
      }
    }

    void loadHistory();

    // 2. Subscribe to Realtime channel for live messages
    const channel = supabase
      .channel(`room_chat_${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "room_messages",
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (!isOpen) {
            setUnreadCount((c) => c + 1);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, [roomCode, isOpen]);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setInput("");

    const optimisticId = `opt-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      room_code: roomCode,
      sender_id: currentUserId,
      sender_name: currentUserName,
      message: text,
      created_at: new Date().toISOString(),
    };

    // Optimistic UI append
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const { data, error } = await supabase
        .from("room_messages")
        .insert({
          room_code: roomCode,
          sender_id: currentUserId,
          sender_name: currentUserName,
          message: text,
        })
        .select()
        .single();

      if (!error && data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? (data as ChatMessage) : m))
        );
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-burgundy-200/80 bg-white shadow-lg">
      {/* Header bar with toggle */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
        className="flex cursor-pointer items-center justify-between border-b border-burgundy-100 bg-gradient-to-r from-burgundy-900 to-burgundy-950 px-4 py-3 text-cream-50"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <h3 className="text-sm font-bold tracking-wide">
            Battle Room Chat (Live)
          </h3>
          {!isOpen && unreadCount > 0 && (
            <span className="rounded-full bg-burgundy-500 px-2 py-0.5 text-xs font-bold text-white">
              {unreadCount} new
            </span>
          )}
        </div>
        <button
          type="button"
          className="text-xs font-semibold text-burgundy-300 hover:text-white"
        >
          {isOpen ? "Minimize ▲" : "Expand ▼"}
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col h-72">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream-50/40 text-xs">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-burgundy-700/60">
                <span className="text-xl">💬</span>
                <p className="mt-1 font-medium">Battle room chat is open.</p>
                <p className="text-[11px]">Up to 20 doctors can discuss here in real time.</p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender_id === currentUserId;
                const time = new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-semibold text-burgundy-950">
                        {isMe ? "You" : m.sender_name}
                      </span>
                      {isHost && isMe && (
                        <span className="rounded bg-burgundy-100 px-1 py-0.2 text-[10px] font-bold text-burgundy-800">
                          Host
                        </span>
                      )}
                      <span className="text-[10px] text-burgundy-400">{time}</span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                        isMe
                          ? "bg-burgundy-600 text-white rounded-tr-none"
                          : "border border-burgundy-100 bg-white text-burgundy-900 rounded-tl-none"
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSend}
            className="border-t border-burgundy-100 bg-white p-2.5 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Input your answers here"
              className="flex-1 min-w-0 rounded-xl border border-burgundy-200 bg-cream-50/70 px-3.5 py-2 text-xs text-burgundy-950 outline-none placeholder:text-burgundy-700/50 focus:border-burgundy-600 focus:bg-white focus:ring-1 focus:ring-burgundy-600"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-burgundy-600 px-4 py-2 text-xs font-bold text-cream-50 shadow-sm transition-all hover:bg-burgundy-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <span>➤</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
