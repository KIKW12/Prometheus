"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserAsync, isAuthenticatedAsync } from "@/lib/auth";

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  type: 'job_posting' | 'job_search';
}

export default function Sidebar() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number } | null>(null);
  const menuButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Load conversations from Supabase on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const authenticated = await isAuthenticatedAsync();
        if (!authenticated) {
          setConversations([]);
          return;
        }

        const user = await getCurrentUserAsync();
        if (!user) {
          setConversations([]);
          return;
        }

        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.userId)
          .not('messages', 'is', null);

        if (error) {
          console.error("Error loading conversations:", error);
          setConversations([]);
          return;
        }

        const loadedConversations: Conversation[] = (data || [])
          .filter(row => row.messages && row.messages.length > 0)
          .map(row => ({
            id: row.id,
            title: row.title,
            timestamp: new Date(row.timestamp),
            type: row.type
          }));

        setConversations(loadedConversations);
      } catch (error) {
        console.error("Error loading conversations:", error);
        // Fallback to sample data if Supabase fails
        const sampleConversations: Conversation[] = [
          {
            id: "1",
            title: "React Developer Position",
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            type: "job_posting"
          },
          {
            id: "2",
            title: "Looking for UI/UX Designers",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            type: "job_search"
          },
          {
            id: "3",
            title: "Backend Engineer - Node.js",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            type: "job_posting"
          }
        ];
        setConversations(sampleConversations);
      }
    };

    loadConversations();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.conversation-menu')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const createNewConversation = async () => {
    // Navigate directly to the find/dashboard page instead of creating empty conversation
    router.push("/find");
  };

  const selectConversation = (conversation: Conversation) => {
    // Navigate to the specific chat
    router.push(`/chat/${conversation.id}`);
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
      setConversations(updatedConversations);
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const startEditing = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
    setOpenMenuId(null);
  };

  const saveEdit = async (conversationId: string) => {
    if (editingTitle.trim()) {
      try {
        const { error } = await supabase
          .from('conversations')
          .update({ title: editingTitle.trim() })
          .eq('id', conversationId);

        if (error) throw error;

        const updatedConversations = conversations.map(conv =>
          conv.id === conversationId ? { ...conv, title: editingTitle.trim() } : conv
        );
        setConversations(updatedConversations);
      } catch (error) {
        console.error("Error updating conversation:", error);
      }
    }
    setEditingId(null);
    setEditingTitle("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleMenuClick = (conversationId: string) => {
    const isOpen = openMenuId === conversationId;
    if (isOpen) {
      setOpenMenuId(null);
      setMenuCoords(null);
      return;
    }

    const btn = menuButtonRefs.current[conversationId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      // Position menu slightly below the button, aligned to the right edge
      setMenuCoords({ top: rect.bottom + 8, left: rect.right - 140 });
    } else {
      setMenuCoords(null);
    }

    setOpenMenuId(conversationId);
  };

  return (
    <div className="fixed inset-y-0 hidden w-[290px] border-r border-dashed bg-surface py-6 pl-6 transition-all md:block border-muted">
      <div className="relative flex h-full flex-col gap-2">
        {/* Logo */}
        <a className="pl-2" href="/">
          <div className="flex w-full items-center">
            <img src="/prometheus.svg" alt="Logo" width="64" height="64" />
            <span className="ml-1 text-primary text-3xl font-averia">Prometheus</span>
          </div>
        </a>

        {/* New Chat Button */}
        <div className="px-2 pt-4 mr-6 ">
          <button
            onClick={createNewConversation}
            className="w-full bg-primary text-foreground relative inline-flex items-center justify-center text-sm font-semibold tracking-base ring-offset-background transition-colors focus-visible:outline-none disabled:opacity-50 shadow-sm hover:brightness-95 h-[36px] px-3 py-2 rounded-md"
          >
            <svg className="w-4 h-4 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Search
          </button>
        </div>

        {/* History Section */}
        <div className="flex-1 px-2 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">History</h3>
          </div>

          <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="relative group">
                {editingId === conversation.id ? (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(conversation.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="flex-1 bg-background border border-muted px-2 py-1 text-xs text-foreground outline-none focus:border-primary rounded"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(conversation.id)}
                      className="text-primary hover:text-primary/80 text-xs"
                    >
                      ✓
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-muted hover:text-foreground text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => selectConversation(conversation)}
                      className="w-full text-left px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-background/50 rounded-md transition-colors pr-8"
                    >
                      <div className="text-xs text-muted truncate">
                        {conversation.title}
                      </div>
                    </button>
                    <button
                      ref={(el) => { menuButtonRefs.current[conversation.id] = el; }}
                      onClick={() => handleMenuClick(conversation.id)}
                      aria-haspopup="true"
                      aria-expanded={openMenuId === conversation.id}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </>
                )}

                {openMenuId === conversation.id && menuCoords && (
                  <div
                    className="conversation-menu fixed bg-surface border border-muted rounded-md shadow-lg py-1 z-[9999] min-w-[140px]"
                    style={{ top: menuCoords.top, left: menuCoords.left }}
                    role="menu"
                    aria-labelledby={`menu-${conversation.id}`}
                  >
                    <button
                      onClick={() => startEditing(conversation)}
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-background/50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Rename
                    </button>
                    <button
                      onClick={() => deleteConversation(conversation.id)}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-background/50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="px-3 py-4 text-center text-muted text-sm">
                No searches yet. Start by creating a new search!
              </div>
            )}
          </div>
        </div>

        {/* Profile and Logout Buttons */}
        <div className="mt-auto flex flex-col gap-3 pr-6">
          <button
            onClick={() => router.push('/company-profile')}
            className="w-full relative inline-flex items-center justify-center text-base font-semibold tracking-base shadow ring-offset-background transition-colors focus-visible:outline-none disabled:opacity-50 border border-muted hover:bg-background/80 h-[42px] px-4 py-2 text-foreground"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </button>

          <button
            onClick={() => {
              // Clear all data and redirect to home
              localStorage.clear();
              window.location.href = '/';
            }}
            className="w-full relative inline-flex items-center justify-center text-base font-semibold tracking-base shadow ring-offset-background transition-colors focus-visible:outline-none disabled:opacity-50 border border-muted hover:bg-background/80 h-[42px] px-4 py-2 text-foreground"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}