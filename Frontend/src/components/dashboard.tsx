import TeamCarousel from './TeamCarousel';
import ButtonCarousel from './ButtonCarousel';
import MessageInput from './MessageInput';
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabase";
import { getCurrentUserAsync } from "@/lib/auth";

interface DashboardProps {
  conversationId?: string;
}

const suggestionPrompts = [
  "looking for a marketer",
  "show me hardware people",
  "need a producer for my album",
  "i need to hire a react engineer",
  "show me content creators",
  "experts on tiktok",
  "who are some people i should invest in?",
  "tell me the legend of naveed",
  "i'm building in gaming",
  "show me fast growing projects"
];

export default function Dashboard({ conversationId }: DashboardProps) {
  const router = useRouter();

  const teamMembers = [
    {
      name: 'Kike',
      image: '/kike.jpeg',
      description: 'Team Member'
    },
    {
      name: 'Leo',
      image: '/leo.jpg',
      description: 'Team Member'
    },
    {
      name: 'Ian',
      image: '/Ian.jpg',
      description: 'Team Member'
    },
    {
      name: 'Mateo',
      image: '/mateo.jpeg',
      description: 'Team Member'
    },
    {
      name: 'Jhon',
      image: '/jhon.jpg',
      description: 'Team Member'
    }
  ];

  const handleSendMessage = async (message: string) => {
    try {
      const user = await getCurrentUserAsync();
      if (!user) {
        router.push("/");
        return;
      }

      if (conversationId) {
        // Update existing conversation - get current messages and append
        const { data: existingConv, error: fetchError } = await supabase
          .from('conversations')
          .select('messages')
          .eq('id', conversationId)
          .single();

        if (fetchError) throw fetchError;

        const newMessage = {
          id: Date.now().toString(),
          content: message,
          sender: 'user' as const,
          timestamp: new Date().toISOString()
        };

        const updatedMessages = [...(existingConv?.messages || []), newMessage];

        const { error: updateError } = await supabase
          .from('conversations')
          .update({ messages: updatedMessages })
          .eq('id', conversationId);

        if (updateError) throw updateError;

        // Also update localStorage
        const existingConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const conversationIndex = existingConversations.findIndex((conv: any) => conv.id === conversationId);
        if (conversationIndex !== -1) {
          existingConversations[conversationIndex].messages.push(newMessage);
          localStorage.setItem('conversations', JSON.stringify(existingConversations));
        }

        // Stay on the same page - no navigation needed
        return;
      }

      const title = message.length > 50 ? message.substring(0, 50) + '...' : message;

      // Check if a conversation with this title already exists for this user
      const { data: existingConvs, error: searchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('title', title)
        .eq('user_id', user.userId);

      if (searchError) throw searchError;

      if (existingConvs && existingConvs.length > 0) {
        // Conversation already exists, navigate to it
        router.push(`/chat/${existingConvs[0].id}`);
        return;
      }

      // Create new conversation in Supabase
      const { data: newConv, error: insertError } = await supabase
        .from('conversations')
        .insert({
          title: title,
          timestamp: new Date().toISOString(),
          type: 'job_search',
          user_id: user.userId,
          messages: [{
            id: Date.now().toString(),
            content: message,
            sender: 'user',
            timestamp: new Date().toISOString()
          }]
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Also save to localStorage for consistency
      const newConversation = {
        id: newConv.id,
        title: title,
        timestamp: new Date(),
        type: 'job_search' as const,
        messages: [{
          id: Date.now().toString(),
          content: message,
          sender: 'user' as const,
          timestamp: new Date()
        }]
      };

      const existingConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
      const updatedConversations = [newConversation, ...existingConversations];
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));

      // Navigate to the new chat
      router.push(`/chat/${newConv.id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      // Fallback: create in localStorage only
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
      const newConversation = {
        id: Date.now().toString(),
        title: title,
        timestamp: new Date(),
        type: 'job_search' as const,
        messages: [{
          id: Date.now().toString(),
          content: message,
          sender: 'user' as const,
          timestamp: new Date()
        }]
      };

      const existingConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
      const updatedConversations = [newConversation, ...existingConversations];
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));

      router.push(`/chat/${newConversation.id}`);
    }
  };

  const handleButtonClick = async (buttonText: string) => {
    await handleSendMessage(buttonText);
  };

  return (
    <main className="flex w-full flex-1 flex-col md:pl-[272px] lg:pr-0">
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <div className="flex flex-col gap-8 items-center w-full max-w-4xl">
          {/* Hero Text */}
          <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl text-center text-foreground font-inter">
            find and<br />be found.
          </h1>

          {/* Team Carousel */}
          <div className="w-full">
            <TeamCarousel teamMembers={teamMembers} />
          </div>

          {/* Button Carousels */}
          <div className="flex flex-col gap-3 w-full">
            <ButtonCarousel
              items={suggestionPrompts}
              onItemClick={handleButtonClick}
              direction="left"
              duration={35}
            />
            <ButtonCarousel
              items={suggestionPrompts}
              onItemClick={handleButtonClick}
              direction="right"
              duration={40}
            />
          </div>
        </div>
      </div>

      {/* Footer - Message Input */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[272px] bg-background/80 backdrop-blur-md border-t border-muted/20">
        <div className="max-w-xl mx-auto px-4 py-4">
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </main>
  );
}