"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useNavigate, Route } from "@/lib/navigation";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Search,
  SendHorizontal,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/EmptyState";
import { MemberPageTitle } from "@/components/member/MemberPageTitle";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { getSocket } from "@/lib/socket-client";
import { cn } from "@/lib/utils";
import type { Socket } from "socket.io-client";

interface Recipient {
  id: string;
  name: string;
  gender?: string;
  isOnline: boolean;
  lastSeen?: string;
  photoUrl?: string;
  city?: string;
  occupation?: string;
  profileId?: string;
}

interface ConversationItem {
  id: string;
  recipient: Recipient;
  lastMessage: string;
  lastMessageAt: string;
  lastSenderId: string | null;
  unreadCount: number;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType?: "text" | "image" | "audio" | "file";
  status: "sent" | "delivered" | "read";
  readAt?: string;
  createdAt: string;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  profileId?: string;
}

function formatChatTime(dateString?: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return "";
  }
}

function formatChatDateHeader(dateString: string): string {
  try {
    const d = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return "";
  }
}

function formatLastSeen(lastSeen?: string): string {
  if (!lastSeen) return "Offline";
  try {
    const d = new Date(lastSeen);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));

    if (diffMin < 1) return "Last seen just now";
    if (diffMin < 60) return `Last seen ${diffMin}m ago`;
    if (diffMin < 1440) {
      return `Last seen today at ${d.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      })}`;
    }
    return `Last seen ${d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Kolkata",
    })}`;
  } catch {
    return "Offline";
  }
}

/**
 * Plays a pleasant audio chime when a new chat message arrives.
 */
function playMessageChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    const currentTime = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, currentTime + 0.14); // A5

    gain.gain.setValueAtTime(0.18, currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.38);

    osc.start(currentTime);
    osc.stop(currentTime + 0.38);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Loads conversation messages from browser LocalStorage (static persistence).
 */
function loadLocalChatHistory(conversationId: string): ChatMessage[] {
  if (typeof window === "undefined" || !conversationId) return [];
  try {
    const raw = localStorage.getItem(`pj_local_chat_${conversationId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves a message statically to browser LocalStorage (zero MongoDB storage consumed).
 */
function saveLocalChatMessage(conversationId: string, msg: ChatMessage) {
  if (typeof window === "undefined" || !conversationId || !msg) return;
  try {
    const existing = loadLocalChatHistory(conversationId);
    const index = existing.findIndex(
      (m) =>
        m.id === msg.id ||
        (m.id.startsWith("temp_") &&
          m.senderId === msg.senderId &&
          m.message === msg.message)
    );
    let updated: ChatMessage[];
    if (index !== -1) {
      updated = [...existing];
      updated[index] = msg;
    } else {
      updated = [...existing, msg];
    }
    if (updated.length > 250) {
      updated = updated.slice(updated.length - 250);
    }
    localStorage.setItem(`pj_local_chat_${conversationId}`, JSON.stringify(updated));
  } catch (err) {
    console.warn("LocalStorage save error:", err);
  }
}

/**
 * Updates message status (sent/delivered/read) in LocalStorage.
 */
function updateLocalMessageStatus(
  conversationId: string,
  messageId: string | undefined,
  status: "sent" | "delivered" | "read"
) {
  if (typeof window === "undefined" || !conversationId) return;
  try {
    const existing = loadLocalChatHistory(conversationId);
    const updated = existing.map((m) => {
      if (!messageId || m.id === messageId) {
        return { ...m, status };
      }
      return m;
    });
    localStorage.setItem(`pj_local_chat_${conversationId}`, JSON.stringify(updated));
  } catch { }
}

export default function MessagesPage() {
  const { with: withId } = Route.useSearch();
  const navigate = useNavigate({ from: "/messages" });

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvo, setActiveConvo] = useState<ConversationItem | null>(null);
  const activeConvoRef = useRef<ConversationItem | null>(null);
  const initializedWithRef = useRef<string | null>(null);

  useEffect(() => {
    activeConvoRef.current = activeConvo;
  }, [activeConvo]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // 1. Fetch authenticated user session
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.user) {
            setCurrentUser(data.user);
            if (data.token) {
              try {
                localStorage.setItem("pj_token", data.token);
                localStorage.setItem("pj_jwt_token", data.token);
              } catch { }
              const socket = getSocket(data.token);
              if (socket) socketRef.current = socket;
            }
          }
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    }
    loadUser();
  }, []);

  // 2. Load conversations list
  const loadConversations = useCallback(async () => {
    try {
      setLoadingConvos(true);
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
          return data.conversations as ConversationItem[];
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
      toast.error("Could not load conversations.");
    } finally {
      setLoadingConvos(false);
    }
    return [];
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 3. Handle `?with=<recipientId>` search query
  useEffect(() => {
    if (!withId || !currentUser) return;
    if (initializedWithRef.current === withId && activeConvo) return;

    // Check if conversation already exists in loaded list
    const existing = conversations.find(
      (c) => c.recipient.id === withId || c.recipient.profileId === withId
    );

    if (existing) {
      initializedWithRef.current = withId;
      setActiveConvo(existing);
      return;
    }

    let isSubscribed = true;
    async function initializeTargetConversation() {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId: withId }),
        });

        if (res.ok && isSubscribed) {
          const data = await res.json();
          if (data.ok && data.conversation) {
            initializedWithRef.current = withId;
            setConversations((prev) => {
              const already = prev.some((c) => c.id === data.conversation.id);
              if (already) return prev;
              return [data.conversation, ...prev];
            });
            setActiveConvo(data.conversation);
          }
        }
      } catch (err) {
        console.error("Error creating target conversation:", err);
      }
    }

    initializeTargetConversation();
    return () => {
      isSubscribed = false;
    };
  }, [withId, currentUser, conversations.length]);

  // 4. Initialize Socket.IO connection & event handlers
  useEffect(() => {
    if (!currentUser) return;

    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    // Listen: Online users list on initial connection
    socket.on("online-users", ({ userIds }: { userIds: string[] }) => {
      setConversations((prev) =>
        prev.map((c) => ({
          ...c,
          recipient: {
            ...c.recipient,
            isOnline: userIds.includes(c.recipient.id),
          },
        }))
      );
      const active = activeConvoRef.current;
      if (active) {
        setActiveConvo({
          ...active,
          recipient: {
            ...active.recipient,
            isOnline: userIds.includes(active.recipient.id),
          },
        });
      }
    });

    // Listen: User comes online
    socket.on("user-online", ({ userId }: { userId: string }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.recipient.id === userId
            ? { ...c, recipient: { ...c.recipient, isOnline: true } }
            : c
        )
      );
      const active = activeConvoRef.current;
      if (active && active.recipient.id === userId) {
        setActiveConvo({
          ...active,
          recipient: { ...active.recipient, isOnline: true },
        });
      }
    });

    // Listen: User goes offline
    socket.on(
      "user-offline",
      ({ userId, lastSeen }: { userId: string; lastSeen: string }) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.recipient.id === userId
              ? { ...c, recipient: { ...c.recipient, isOnline: false, lastSeen } }
              : c
          )
        );
        const active = activeConvoRef.current;
        if (active && active.recipient.id === userId) {
          setActiveConvo({
            ...active,
            recipient: { ...active.recipient, isOnline: false, lastSeen },
          });
        }
      }
    );

    // Listen: Receive new message (Instant delivery without whole page refresh)
    socket.on("receive-message", (newMsg: ChatMessage & { senderName?: string }) => {
      const active = activeConvoRef.current;

      // Save to static browser LocalStorage (zero MongoDB collection size used)
      saveLocalChatMessage(newMsg.conversationId, newMsg);

      // 1. If currently in this active conversation, append message or reconcile optimistic
      const isCurrentChat =
        active &&
        (active.id === newMsg.conversationId ||
          active.recipient.id === newMsg.senderId ||
          active.recipient.id === newMsg.receiverId);

      if (isCurrentChat) {
        setMessages((prev) => {
          // Check if already in messages (e.g. by real ID or by optimistic temp ID)
          const tempIndex = prev.findIndex(
            (m) =>
              m.id === newMsg.id ||
              (m.id.startsWith("temp_") &&
                m.senderId === newMsg.senderId &&
                m.message === newMsg.message)
          );
          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = newMsg;
            return updated;
          }
          return [...prev, newMsg];
        });

        // If message is from other user, play audio chime and show incoming alert
        if (newMsg.senderId !== currentUser.id) {
          playMessageChime();
          const senderName = newMsg.senderName || active.recipient.name || "A member";
          toast.info(`💬 ${senderName}`, {
            description: newMsg.message.length > 70 ? `${newMsg.message.slice(0, 70)}...` : newMsg.message,
            duration: 4000,
          });

          socket.emit("mark-message-read", {
            conversationId: newMsg.conversationId,
            messageId: newMsg.id,
          });
        }
      } else {
        // Incoming message from another conversation
        if (newMsg.senderId !== currentUser.id) {
          playMessageChime();
          const senderName = newMsg.senderName || "A member";
          toast.message(`💬 ${senderName}`, {
            description: newMsg.message.length > 70 ? `${newMsg.message.slice(0, 70)}...` : newMsg.message,
            duration: 5000,
            action: {
              label: "Open Chat",
              onClick: () => {
                setConversations((all) => {
                  const target = all.find((c) => c.id === newMsg.conversationId);
                  if (target) setActiveConvo(target);
                  return all;
                });
              },
            },
          });
        }
      }

      // 2. Update conversation preview in sidebar
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === newMsg.conversationId);
        if (index === -1) {
          loadConversations();
          return prev;
        }

        const updated = [...prev];
        const target = { ...updated[index] };
        target.lastMessage = newMsg.message;
        target.lastMessageAt = newMsg.createdAt;
        target.lastSenderId = newMsg.senderId;

        // If not in active conversation, increment unread badge
        if (
          (!active || active.id !== newMsg.conversationId) &&
          newMsg.senderId !== currentUser.id
        ) {
          target.unreadCount = (target.unreadCount || 0) + 1;
        }

        updated.splice(index, 1);
        return [target, ...updated];
      });
    });

    // Listen: Message delivered status
    socket.on(
      "message-delivered",
      ({
        conversationId,
        messageId,
      }: {
        conversationId: string;
        messageId: string;
      }) => {
        updateLocalMessageStatus(conversationId, messageId, "delivered");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId || (m.conversationId === conversationId && m.status === "sent")
              ? { ...m, status: "delivered" }
              : m
          )
        );
      }
    );

    // Listen: Message read status
    socket.on(
      "message-read",
      ({
        conversationId,
        messageId,
      }: {
        conversationId: string;
        messageId?: string;
      }) => {
        updateLocalMessageStatus(conversationId, messageId, "read");
        setMessages((prev) =>
          prev.map((m) => {
            if (m.conversationId !== conversationId) return m;
            if (!messageId || m.id === messageId) {
              return { ...m, status: "read" };
            }
            return m;
          })
        );
      }
    );

    // Listen: Recipient typing
    socket.on(
      "user-typing",
      ({ conversationId, userId }: { conversationId: string; userId: string }) => {
        const active = activeConvoRef.current;
        if (active && active.id === conversationId && active.recipient.id === userId) {
          setIsRecipientTyping(true);
        }
      }
    );

    // Listen: Recipient stopped typing
    socket.on(
      "user-stop-typing",
      ({ conversationId, userId }: { conversationId: string; userId: string }) => {
        const active = activeConvoRef.current;
        if (active && active.id === conversationId && active.recipient.id === userId) {
          setIsRecipientTyping(false);
        }
      }
    );

    // Rejoin conversation room automatically upon socket connect or reconnect
    const handleConnect = () => {
      const active = activeConvoRef.current;
      if (active) {
        socket.emit("join-conversation", { conversationId: active.id });
        socket.emit("mark-message-read", { conversationId: active.id });
      }
    };
    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("online-users");
      socket.off("user-online");
      socket.off("user-offline");
      socket.off("receive-message");
      socket.off("message-delivered");
      socket.off("message-read");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, [currentUser, loadConversations]);

  // 5. Join room and load messages when active conversation changes
  useEffect(() => {
    if (!activeConvo || !currentUser) return;

    const conversationId = activeConvo.id;
    setIsRecipientTyping(false);

    // Join room via socket
    if (socketRef.current) {
      if (socketRef.current.connected) {
        socketRef.current.emit("join-conversation", { conversationId });
        socketRef.current.emit("mark-message-read", { conversationId });
      } else {
        socketRef.current.once("connect", () => {
          socketRef.current?.emit("join-conversation", { conversationId });
          socketRef.current?.emit("mark-message-read", { conversationId });
        });
      }
    }

    // Mark read on server
    fetch(`/api/messages/${conversationId}/read-all`, {
      method: "PATCH",
    }).catch(() => { });

    // Clear unread count in sidebar
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );

    // Fetch conversation message history (Cached in static LocalStorage + Server sync)
    async function loadMessages() {
      // 1. Immediately render cached messages from LocalStorage (0ms instant render)
      const localMsgs = loadLocalChatHistory(conversationId);
      if (localMsgs.length > 0) {
        setMessages(localMsgs);
      }

      setLoadingMessages(localMsgs.length === 0);
      try {
        const res = await fetch(`/api/messages/${conversationId}?limit=60`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.messages)) {
            if (data.messages.length > 0) {
              setMessages((prev) => {
                const map = new Map<string, ChatMessage>();
                prev.forEach((m) => map.set(m.id, m));
                data.messages.forEach((m: ChatMessage) => map.set(m.id, m));
                const merged = Array.from(map.values()).sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                try {
                  localStorage.setItem(`pj_local_chat_${conversationId}`, JSON.stringify(merged));
                } catch { }
                return merged;
              });
            }
            if (data.recipient) {
              setActiveConvo((prev) =>
                prev ? { ...prev, recipient: { ...prev.recipient, ...data.recipient } } : null
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();
  }, [activeConvo?.id, currentUser]);

  // 6. Background sync fallback (gentle 15s interval, only if socket is disconnected and tab is visible)
  useEffect(() => {
    if (!activeConvo?.id) return;
    const conversationId = activeConvo.id;
    let inFlight = false;

    const interval = setInterval(async () => {
      // If socket is connected, WebSocket handles real-time delivery instantly
      if (socketRef.current?.connected) return;
      if (typeof document !== "undefined" && document.hidden) return;
      if (inFlight) return;

      inFlight = true;
      try {
        const res = await fetch(`/api/messages/${conversationId}?limit=30`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const newIncoming = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
              if (newIncoming.length === 0) return prev;
              newIncoming.forEach((m: ChatMessage) => saveLocalChatMessage(conversationId, m));
              return [...prev, ...newIncoming];
            });
          }
        }
      } catch {
        // Silently ignore network hiccups
      } finally {
        inFlight = false;
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [activeConvo?.id]);

  // 6. Scroll smoothly to latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length, isRecipientTyping]);

  // 7. Handle typing events
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (!socketRef.current || !activeConvo) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketRef.current.emit("typing", {
        conversationId: activeConvo.id,
        receiverId: activeConvo.recipient.id,
      });
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socketRef.current?.emit("stop-typing", {
        conversationId: activeConvo.id,
        receiverId: activeConvo.recipient.id,
      });
    }, 2000);
  };

  // 8. Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText || !activeConvo || !currentUser || sending) return;

    // Stop typing indicator immediately
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socketRef.current?.emit("stop-typing", {
        conversationId: activeConvo.id,
        receiverId: activeConvo.recipient.id,
      });
    }

    // Generate instant client ID and optimistic message (0ms delivery experience)
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      conversationId: activeConvo.id,
      senderId: currentUser.id,
      receiverId: activeConvo.recipient.id,
      message: cleanText,
      messageType: "text",
      status: "sent",
      createdAt: new Date().toISOString(),
    };

    // 0ms Optimistic UI Update: Render immediately in sender's chat!
    setMessages((prev) => [...prev, optimisticMsg]);
    saveLocalChatMessage(activeConvo.id, optimisticMsg);
    setText("");

    // Update sidebar conversation preview immediately
    setConversations((prev) => {
      const index = prev.findIndex((c) => c.id === activeConvo.id);
      if (index === -1) return prev;
      const updated = [...prev];
      const target = { ...updated[index] };
      target.lastMessage = cleanText;
      target.lastMessageAt = new Date().toISOString();
      target.lastSenderId = currentUser.id;
      updated.splice(index, 1);
      return [target, ...updated];
    });

      // 1. WebSocket Instant Transmission (low-latency <5ms path when connected)
      const socket = socketRef.current || getSocket();
      if (socket && socket.connected) {
        socketRef.current = socket;
        socket.emit(
          "send-message",
          {
            conversationId: activeConvo.id,
            receiverId: activeConvo.recipient.id,
            message: cleanText,
            messageType: "text",
          },
          (response: { ok: boolean; message?: ChatMessage; error?: string }) => {
            if (response?.ok && response.message) {
              const realMsg = response.message;
              setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? realMsg : m))
              );
              saveLocalChatMessage(activeConvo.id, realMsg);
              // Alert for particular sent message
              toast.success(`Message sent to ${activeConvo.recipient.name}`, {
                description: cleanText.length > 60 ? `${cleanText.slice(0, 60)}...` : cleanText,
                icon: "✉️",
                duration: 3500,
              });
            } else {
              toast.error(response?.error || "Failed to send message.");
              setMessages((prev) => prev.filter((m) => m.id !== tempId));
              try {
                const filtered = loadLocalChatHistory(activeConvo.id).filter((m) => m.id !== tempId);
                localStorage.setItem(`pj_local_chat_${activeConvo.id}`, JSON.stringify(filtered));
              } catch { }
            }
          }
        );
      } else {
        // 2. High-reliability REST fallback if socket is reconnecting or server is standard Next dev
        try {
          fetch(`/api/messages/${activeConvo.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: cleanText,
              receiverId: activeConvo.recipient.id,
              messageType: "text",
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.ok && data.message) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === tempId ? data.message : m))
                );
                saveLocalChatMessage(activeConvo.id, data.message);
                // Alert for particular sent message
                toast.success(`Message sent to ${activeConvo.recipient.name}`, {
                  description: cleanText.length > 60 ? `${cleanText.slice(0, 60)}...` : cleanText,
                  icon: "✉️",
                  duration: 3500,
                });
              } else {
                toast.error(data.error || "Failed to deliver message.");
                setMessages((prev) => prev.filter((m) => m.id !== tempId));
                try {
                  const filtered = loadLocalChatHistory(activeConvo.id).filter((m) => m.id !== tempId);
                  localStorage.setItem(`pj_local_chat_${activeConvo.id}`, JSON.stringify(filtered));
                } catch { }
              }
            })
            .catch(() => {
              toast.error("Network issue. Please try sending again.");
              setMessages((prev) => prev.filter((m) => m.id !== tempId));
              try {
                const filtered = loadLocalChatHistory(activeConvo.id).filter((m) => m.id !== tempId);
                localStorage.setItem(`pj_local_chat_${activeConvo.id}`, JSON.stringify(filtered));
              } catch { }
            });
        } catch {
          toast.error("Network issue. Please try sending again.");
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          try {
            const filtered = loadLocalChatHistory(activeConvo.id).filter((m) => m.id !== tempId);
            localStorage.setItem(`pj_local_chat_${activeConvo.id}`, JSON.stringify(filtered));
          } catch { }
        }
      }
    };

    // Filter conversations by search term
    const filteredConversations = useMemo(() => {
      if (!search.trim()) return conversations;
      const q = search.toLowerCase();
      return conversations.filter(
        (c) =>
          c.recipient.name.toLowerCase().includes(q) ||
          (c.recipient.city && c.recipient.city.toLowerCase().includes(q))
      );
    }, [conversations, search]);

    return (
        <div className="w-full">
          <MemberPageTitle
            title="Messages & Live Chat"
            text="Connect in real time with trusted prospective brides and grooms."
          />

          <div className="surface mt-4 grid h-[680px] overflow-hidden rounded-3xl border shadow-sm md:grid-cols-[320px_1fr]">
            {/* ================= LEFT SIDEBAR: CONVERSATIONS LIST ================= */}
            <aside
              className={cn(
                "flex flex-col border-r bg-card/60 transition-all",
                activeConvo && "hidden md:flex"
              )}
            >
              {/* Sidebar Header & Search */}
              <div className="border-b p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Conversations
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => loadConversations()}
                    aria-label="Refresh conversations"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className={cn("h-4 w-4", loadingConvos && "animate-spin")} />
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 pl-9 text-xs rounded-xl bg-background/80"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto divide-y divide-border/60">
                {loadingConvos && conversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    Loading conversations...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                    <p className="font-semibold text-foreground">No conversations found</p>
                    <p>
                      Explore matches and send an interest to start chatting with verified profiles.
                    </p>
                    <Button asChild size="sm" variant="outline" className="mt-2 text-xs">
                      <Link to="/matches">Discover Matches</Link>
                    </Button>
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const isSelected = activeConvo?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setActiveConvo(c);
                          navigate({ search: { with: c.recipient.id }, replace: true });
                        }}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-3 p-3.5 text-left transition-colors hover:bg-muted/70",
                          isSelected && "bg-primary/10 border-l-4 border-primary"
                        )}
                      >
                        {/* Recipient Avatar with Online Badge */}
                        <div className="relative shrink-0">
                          <ProfileAvatar
                            name={c.recipient.name}
                            photoUrl={c.recipient.photoUrl}
                            imageUrl={c.recipient.photoUrl}
                            size="md"
                            className="ring-1 ring-gold/40"
                          />
                          <span
                            className={cn(
                              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                              c.recipient.isOnline ? "bg-emerald-500" : "bg-zinc-400"
                            )}
                            title={c.recipient.isOnline ? "Online" : "Offline"}
                          />
                        </div>

                        {/* Preview Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate text-sm font-semibold text-foreground">
                              {c.recipient.name}
                            </span>
                            {c.lastMessageAt && (
                              <span className="shrink-0 text-[10px] text-muted-foreground">
                                {formatChatTime(c.lastMessageAt)}
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center justify-between gap-2">
                            <p className="truncate text-xs text-muted-foreground">
                              {c.lastMessage || "Start conversation 👋"}
                            </p>
                            {c.unreadCount > 0 && (
                              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs">
                                {c.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* ================= RIGHT MAIN SECTION: ACTIVE CHAT ================= */}
            <main
              className={cn(
                "flex min-h-0 flex-col bg-background/50",
                !activeConvo && "hidden md:flex"
              )}
            >
              {activeConvo ? (
                <>
                  {/* Active Chat Header */}
                  <header className="flex items-center justify-between border-b bg-card/80 px-4 py-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      {/* Back button on mobile */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveConvo(null);
                          navigate({ search: {}, replace: true });
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground md:hidden"
                        aria-label="Back to conversations list"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>

                      {/* Recipient Profile Avatar */}
                      <div className="relative">
                        <ProfileAvatar
                          name={activeConvo.recipient.name}
                          photoUrl={activeConvo.recipient.photoUrl}
                          imageUrl={activeConvo.recipient.photoUrl}
                          size="sm"
                          className="ring-1 ring-gold/40"
                        />
                        <span
                          className={cn(
                            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                            activeConvo.recipient.isOnline ? "bg-emerald-500" : "bg-zinc-400"
                          )}
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm leading-tight text-foreground flex items-center gap-1.5">
                          {activeConvo.recipient.name}
                          <span title="Verified Member">
                            <ShieldCheck className="h-3.5 w-3.5 text-gold shrink-0" />
                          </span>
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          {activeConvo.recipient.isOnline ? (
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              ● Online
                            </span>
                          ) : (
                            formatLastSeen(activeConvo.recipient.lastSeen)
                          )}
                          {activeConvo.recipient.city ? ` · ${activeConvo.recipient.city}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* View Profile Action */}
                    {activeConvo.recipient.profileId && (
                      <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-full">
                        <Link
                          to="/profiles/$id"
                          params={{ id: activeConvo.recipient.profileId }}
                        >
                          <UserIcon className="h-3.5 w-3.5" />
                          View Profile
                        </Link>
                      </Button>
                    )}
                  </header>

                  {/* Chat Message Scrollable Container */}
                  <div className="flex-1 space-y-4 overflow-y-auto p-4 bg-muted/20">
                    {loadingMessages ? (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                        Loading conversation history...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="py-16 text-center text-xs text-muted-foreground space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
                          💍
                        </div>
                        <p className="font-medium text-sm text-foreground">
                          Begin your journey with {activeConvo.recipient.name}
                        </p>
                        <p className="max-w-xs mx-auto text-muted-foreground">
                          Say hello, introduce yourself, and share your matrimonial aspirations respectfully.
                        </p>
                      </div>
                    ) : (
                      messages.map((m, idx) => {
                        const isMine = m.senderId === currentUser?.id;
                        const prevMsg = messages[idx - 1];
                        const showDateHeader =
                          !prevMsg ||
                          new Date(prevMsg.createdAt).toDateString() !==
                          new Date(m.createdAt).toDateString();

                        return (
                          <div key={m.id || idx}>
                            {/* Day separator header */}
                            {showDateHeader && (
                              <div className="my-3 flex items-center justify-center">
                                <span className="rounded-full bg-muted/80 px-3 py-1 text-[10px] font-semibold text-muted-foreground shadow-2xs border">
                                  {formatChatDateHeader(m.createdAt)}
                                </span>
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div
                              className={cn(
                                "flex items-end gap-1.5",
                                isMine ? "justify-end" : "justify-start"
                              )}
                            >
                              <div
                                className={cn(
                                  "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-2xs transition-all",
                                  isMine
                                    ? "rounded-br-2xs bg-primary text-primary-foreground"
                                    : "rounded-bl-2xs bg-card border text-card-foreground"
                                )}
                              >
                                <p className="whitespace-pre-wrap break-words leading-relaxed">
                                  {m.message}
                                </p>

                                {/* Bubble Footer: Timestamp & Read Status */}
                                <div
                                  className={cn(
                                    "mt-1 flex items-center justify-end gap-1 text-[10px]",
                                    isMine ? "text-primary-foreground/75" : "text-muted-foreground"
                                  )}
                                >
                                  <span>{formatChatTime(m.createdAt)}</span>
                                  {isMine && (
                                    <span title={`Status: ${m.status}`}>
                                      {m.status === "read" ? (
                                        <CheckCheck className="h-3.5 w-3.5 text-gold" />
                                      ) : m.status === "delivered" ? (
                                        <CheckCheck className="h-3.5 w-3.5" />
                                      ) : (
                                        <Check className="h-3 w-3" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Typing Indicator */}
                    {isRecipientTyping && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                        <div className="flex gap-1 items-center bg-card border rounded-full px-3 py-1.5 shadow-2xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                          <span className="ml-1 text-[11px] font-medium not-italic text-foreground">
                            {activeConvo.recipient.name} is typing...
                          </span>
                        </div>
                      </div>
                    )}

                    <div ref={endRef} />
                  </div>

                  {/* Chat Input Bar */}
                  <form
                    onSubmit={handleSendMessage}
                    className="border-t bg-card/90 p-3 flex items-center gap-2"
                  >
                    <Input
                      value={text}
                      onChange={handleInputChange}
                      placeholder="Type your message..."
                      aria-label="Type message"
                      maxLength={2000}
                      disabled={sending}
                      className="flex-1 rounded-2xl bg-background border-border text-sm focus-visible:ring-primary"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!text.trim() || sending}
                      className="h-10 w-10 shrink-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
                      aria-label="Send Message"
                    >
                      <SendHorizontal className="h-4 w-4" />
                    </Button>
                  </form>
                </>
              ) : (
                /* Empty selection placeholder */
                <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Your Conversations
                    </h3>
                    <p className="mt-1 text-xs max-w-sm text-muted-foreground">
                      Select a member from the conversation list on the left to start a real-time conversation.
                    </p>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
        );
  }
