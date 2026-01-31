import TeamCarousel from './TeamCarousel';
import MessageInput from './MessageInput';
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabase";
import { getCurrentUserAsync } from "@/lib/auth";

interface DashboardProps {
  conversationId?: string;
}

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
    // Reuse handleSendMessage logic
    await handleSendMessage(buttonText);
  };

  return (
    <main className="flex w-full flex-1 flex-col md:pl-[272px] lg:pr-0">
      <div className="pt-8 h-[calc(100dvh-7px)] flex flex-col gap-16">
        <div className="my-18 mx-auto flex flex-col gap-16">
          <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl text-center text-foreground font-inter">
            find and<br />be found.
          </h1>
          <div className="flex flex-col gap-4">
            {/* Team Carousel */}
            <TeamCarousel teamMembers={teamMembers} />

            {/* Carousel for top-Buttons */}
            <div className="relative button-carousel-container" role="region" aria-roledescription="carousel">
              <div className="gap-4 top-button-carousel">
                <button onClick={() => handleButtonClick("looking for a marketer")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">looking for a marketer</button>
                <button onClick={() => handleButtonClick("show me hardware people")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">show me hardware people</button>
                <button onClick={() => handleButtonClick("need a producer for my album")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">need a producer for my album</button>
                <button onClick={() => handleButtonClick("i need to hire a react engineer")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border border-muted px-4 py-1 text-foreground hover:text-primary border-muted">i need to hire a react engineer</button>
                <button onClick={() => handleButtonClick("show me content creators")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">show me content creators</button>
                <button onClick={() => handleButtonClick("experts on tiktok")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">experts on tiktok</button>
                <button onClick={() => handleButtonClick("who are some people i should invest in?")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">who are some people i should invest in?</button>
                <button onClick={() => handleButtonClick("tell me the legend of naveed")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">tell me the legend of naveed</button>
                <button onClick={() => handleButtonClick("i'm building in gaming")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">i'm building in gaming</button>
                <button onClick={() => handleButtonClick("show me fast growing projects")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-1 py-1 text-foreground hover:text-primary border-muted">show me fast growing projects</button>
                {/* Duplicate buttons for infinite loop */}
                <button onClick={() => handleButtonClick("looking for a marketer")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">looking for a marketer</button>
                <button onClick={() => handleButtonClick("show me hardware people")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">show me hardware people</button>
                <button onClick={() => handleButtonClick("need a producer for my album")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">need a producer for my album</button>
                <button onClick={() => handleButtonClick("i need to hire a react engineer")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border border-muted px-4 py-1 text-foreground hover:text-primary border-muted">i need to hire a react engineer</button>
                <button onClick={() => handleButtonClick("show me content creators")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">show me content creators</button>
                <button onClick={() => handleButtonClick("experts on tiktok")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">experts on tiktok</button>
              </div>
            </div>
            {/* Carousel for bottom-Buttons */}
            <div className="relative button-carousel-container" role="region" aria-roledescription="carousel">
              <div className="gap-4 bottom-button-carousel">
                <button onClick={() => handleButtonClick("looking for a marketer")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">looking for a marketer</button>
                <button onClick={() => handleButtonClick("show me hardware people")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">show me hardware people</button>
                <button onClick={() => handleButtonClick("need a producer for my album")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">need a producer for my album</button>
                <button onClick={() => handleButtonClick("i need to hire a react engineer")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border border-muted px-4 py-1 text-foreground hover:text-primary border-muted">i need to hire a react engineer</button>
                <button onClick={() => handleButtonClick("show me content creators")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">show me content creators</button>
                <button onClick={() => handleButtonClick("experts on tiktok")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">experts on tiktok</button>
                <button onClick={() => handleButtonClick("who are some people i should invest in?")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">who are some people i should invest in?</button>
                <button onClick={() => handleButtonClick("tell me the legend of naveed")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">tell me the legend of naveed</button>
                <button onClick={() => handleButtonClick("i'm building in gaming")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">i'm building in gaming</button>
                <button onClick={() => handleButtonClick("show me fast growing projects")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-1 py-1 text-foreground hover:text-primary border-muted">show me fast growing projects</button>
                {/* Duplicate buttons for infinite loop */}
                <button onClick={() => handleButtonClick("looking for a marketer")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">looking for a marketer</button>
                <button onClick={() => handleButtonClick("show me hardware people")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">show me hardware people</button>
                <button onClick={() => handleButtonClick("need a producer for my album")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">need a producer for my album</button>
                <button onClick={() => handleButtonClick("i need to hire a react engineer")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border border-muted px-4 py-1 text-foreground hover:text-primary border-muted">i need to hire a react engineer</button>
                <button onClick={() => handleButtonClick("show me content creators")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">show me content creators</button>
                <button onClick={() => handleButtonClick("experts on tiktok")} className="button-item hover:text-white h-10 flex-shrink-0 cursor-pointer border px-4 py-1 text-foreground hover:text-primary border-muted">experts on tiktok</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky mt-auto md:max-w-xl bottom-0 mx-auto w-full bg-background/70 backdrop-blur-md">
        <div className="flex flex-col gap-4 border-t py-4 md:border-none px-4 md:px-0 md:py-6">
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </main>
  );
}