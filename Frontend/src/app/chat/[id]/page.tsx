"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import MessageInput from "@/components/MessageInput";
import Dashboard from "@/components/dashboard";
import ProspectCard, { ProspectData } from "@/components/ProspectCard";
import ProspectModal from "@/components/ProspectModal";
import { supabase } from "@/lib/supabase";
import { getCurrentUserAsync, isAuthenticatedAsync } from "@/lib/auth";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  type: 'job_posting' | 'job_search';
  messages: Message[];
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState<ProspectData[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<ProspectData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const generateAIResponse = async (conv: Conversation, userMessage: Message) => {
    setIsLoading(true);

    try {
      // Call the conversation agent API
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: conv.id,
          resetConversation: false, // Could be enhanced to detect reset commands
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();

      // Store candidates if returned
      if (data.candidates && data.candidates.length > 0) {
        setCandidates(data.candidates);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date()
      };

      const updatedConversation = {
        ...conv,
        messages: [...conv.messages, aiMessage]
      };
      setConversation(updatedConversation);

      // Update Supabase
      try {
        await supabase
          .from('conversations')
          .update({
            messages: updatedConversation.messages.map(m => ({
              ...m,
              timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
            }))
          })
          .eq('id', conv.id);
      } catch (error) {
        console.error("Error updating conversation:", error);
      }
    } catch (error) {
      console.error("Error generating AI response:", error);

      // Fallback message
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting to the candidate database right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date()
      };

      const updatedConversation = {
        ...conv,
        messages: [...conv.messages, fallbackMessage]
      };
      setConversation(updatedConversation);

      // Update Supabase
      try {
        await supabase
          .from('conversations')
          .update({
            messages: updatedConversation.messages.map(m => ({
              ...m,
              timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
            }))
          })
          .eq('id', conv.id);
      } catch (error) {
        console.error("Error updating conversation:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load conversation from Supabase
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const authenticated = await isAuthenticatedAsync();
        if (!authenticated) {
          router.push("/");
          return;
        }

        const user = await getCurrentUserAsync();
        if (!user) {
          router.push("/");
          return;
        }

        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', chatId)
          .eq('user_id', user.userId)
          .single();

        if (error) {
          console.error("Error loading conversation:", error);
          router.push("/find");
          return;
        }

        if (data) {
          const currentConversation: Conversation = {
            id: data.id,
            title: data.title,
            timestamp: new Date(data.timestamp),
            type: data.type,
            messages: (data.messages || []).map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          };

          // Check if conversation has messages
          if (currentConversation.messages.length === 0) {
            // Empty conversation, redirect to find
            router.push("/find");
            return;
          }

          setConversation(currentConversation);

          // Check if we need to generate AI response for the last user message
          const lastMessage = currentConversation.messages[currentConversation.messages.length - 1];
          if (lastMessage && lastMessage.sender === 'user' && !isLoading) {
            // Check if there's no AI response after this user message
            const messages = currentConversation.messages;
            const lastMessageIndex = messages.length - 1;
            const hasAIReply = lastMessageIndex > 0 && messages[lastMessageIndex - 1]?.sender === 'ai';

            if (!hasAIReply) {
              // Generate AI response for the user message
              generateAIResponse(currentConversation, lastMessage);
            }
          }
        } else {
          // Conversation not found, redirect to find
          router.push("/find");
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
        router.push("/find");
      }
    };

    loadConversation();
  }, [chatId, router]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || !conversation) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message immediately
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage]
    };
    setConversation(updatedConversation);

    // Update Supabase
    try {
      await supabase
        .from('conversations')
        .update({
          messages: updatedConversation.messages.map(m => ({
            ...m,
            timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
          }))
        })
        .eq('id', conversation.id);
    } catch (error) {
      console.error("Error updating conversation:", error);
    }

    // Generate AI response
    await generateAIResponse(updatedConversation, userMessage);
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="flex w-full flex-1 flex-col md:pl-[272px] lg:pr-0">
        <div className="flex flex-col h-screen">
          {/* Chat Header */}
          <div className="border-b border-muted px-8 py-6">
            <h1 className="text-2xl font-semibold text-foreground px-2">{conversation.title}</h1>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {conversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col">
                  {msg.sender === 'ai' && <p className="text-primary text-base mb-1 px-6 text-left font-averia">Prometheus</p>}
                  <div
                    className={`rounded-lg px-6 py-3 ${msg.sender === 'user'
                      ? 'w-full bg-primary text-foreground'
                      : 'w-fit max-w-[70%] bg-transparent text-foreground'
                      }`}
                  >
                    <p className={`text-sm ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-6 py-3 max-w-[70%]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-muted">Prometheus is typing...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Prospect Cards */}
            {candidates.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-muted mb-3 px-1">Top matches:</p>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                  {candidates.slice(0, 5).map((prospect, index) => (
                    <ProspectCard
                      key={prospect.candidate_id}
                      prospect={prospect}
                      index={index}
                      onViewProfile={(id) => {
                        const p = candidates.find(c => c.candidate_id === id);
                        if (p) setSelectedProspect(p);
                      }}
                      onContact={(p) => window.open(`mailto:${p.email}`, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="px-8 py-8">
            <MessageInput
              onSendMessage={sendMessage}
              disabled={isLoading}
            />
          </div>
        </div>
      </main>

      {/* Prospect Profile Modal */}
      <ProspectModal
        prospect={selectedProspect}
        isOpen={selectedProspect !== null}
        onClose={() => setSelectedProspect(null)}
      />
    </>
  );
}