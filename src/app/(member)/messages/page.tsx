"use client";

import { Link, useNavigate, Route } from "@/lib/navigation";
import { ArrowLeft, Info, MessageCircle, SendHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/EmptyState";
import { MemberPageTitle } from "@/components/member/MemberPageTitle";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { formatDateTime, useSession } from "@/hooks/use-demo";
import { sendMessage } from "@/lib/actions";
import { cn } from "@/lib/utils";



function MessagesPage() {
  const { with: withId } = Route.useSearch();
  const navigate = useNavigate({ from: "/messages" });
  const { state, profile } = useSession();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Conversations are available with every accepted connection.
  const threads = useMemo(() => {
    if (!profile) return [];
    const connected = state.interests
      .filter(
        (i) =>
          i.status === "accepted" &&
          (i.fromProfileId === profile.id || i.toProfileId === profile.id),
      )
      .map((i) => (i.fromProfileId === profile.id ? i.toProfileId : i.fromProfileId));
    return [...new Set(connected)]
      .map((otherId) => {
        const other = state.profiles.find((p) => p.id === otherId);
        const convo = state.conversations.find(
          (c) => c.profileIds.includes(profile.id) && c.profileIds.includes(otherId),
        );
        const last = convo?.messages.at(-1);
        return other ? { other, messages: convo?.messages ?? [], last } : null;
      })
      .filter((t): t is NonNullable<typeof t> => !!t)
      .sort((a, b) => (b.last?.at ?? "").localeCompare(a.last?.at ?? ""));
  }, [state, profile]);

  const active = threads.find((t) => t.other.id === withId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [active?.messages.length]);

  if (!profile) return null;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    const r = sendMessage(active.other.id, text);
    if (!r.ok) return toast.error(r.error);
    setText("");
  };

  return (
    <div>
      <MemberPageTitle
        title="Messages"
        text="Chat with members who have accepted your interest (or whose interest you accepted)."
      />
      <div className="mb-4 flex gap-2 rounded-lg border border-gold/40 bg-gold-soft p-3 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <p>
          <strong>Simulated messaging:</strong> conversations and replies are generated for this
          demo and stored only in your browser. No real messages are sent.
        </p>
      </div>
      {threads.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No conversations yet"
          text="When an interest is accepted, you can start chatting here."
          action={
            <Button asChild>
              <Link to="/interests/received">Check your interests</Link>
            </Button>
          }
        />
      ) : (
        <div className="surface grid h-[600px] overflow-hidden md:grid-cols-[260px_1fr]">
          <ul className={cn("divide-y overflow-y-auto border-r", active && "hidden md:block")}>
            {threads.map((t) => (
              <li key={t.other.id}>
                <button
                  type="button"
                  onClick={() => navigate({ search: { with: t.other.id }, replace: true })}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 p-4 text-left hover:bg-muted/60",
                    active?.other.id === t.other.id && "bg-primary-soft",
                  )}
                >
                  <ProfileAvatar
                    name={t.other.name}
                    tone={t.other.tone}
                    size="sm"
                    className="ring-1 ring-offset-1"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{t.other.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {t.last ? t.last.text : "Say hello 👋"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className={cn("flex min-h-0 flex-col", !active && "hidden md:flex")}>
            {active ? (
              <>
                <div className="flex items-center gap-3 border-b p-4">
                  <button
                    type="button"
                    className="cursor-pointer md:hidden"
                    aria-label="Back to conversations"
                    onClick={() => navigate({ search: {}, replace: true })}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <ProfileAvatar
                    name={active.other.name}
                    tone={active.other.tone}
                    size="sm"
                    className="ring-1 ring-offset-1"
                  />
                  <div className="flex-1">
                    <Link
                      to="/profiles/$id"
                      params={{ id: active.other.id }}
                      className="font-semibold hover:text-primary"
                    >
                      {active.other.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {active.other.city} · Simulated chat
                    </p>
                  </div>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto bg-secondary/40 p-4">
                  {active.messages.length === 0 && (
                    <p className="py-10 text-center text-sm text-muted-foreground">
                      No messages yet. Start the conversation!
                    </p>
                  )}
                  {active.messages.map((m) => {
                    const mine = m.fromProfileId === profile.id;
                    return (
                      <div
                        key={m.id}
                        className={cn("flex", mine ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                            mine
                              ? "rounded-br-sm bg-primary text-primary-foreground"
                              : "rounded-bl-sm bg-card",
                          )}
                        >
                          <p>{m.text}</p>
                          <p
                            className={cn(
                              "mt-1 text-[10px]",
                              mine ? "text-primary-foreground/70" : "text-muted-foreground",
                            )}
                          >
                            {formatDateTime(m.at)} · simulated
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={endRef} />
                </div>
                <form onSubmit={send} className="flex gap-2 border-t p-3">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a message…"
                    aria-label="Message"
                    maxLength={1000}
                    className="bg-card"
                  />
                  <Button type="submit" size="icon" aria-label="Send" disabled={!text.trim()}>
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
                Select a conversation to start chatting.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesPage;
