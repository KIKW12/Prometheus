import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId, resetConversation = false } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Call the Python conversation agent server
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
    const response = await fetch(`${backendUrl}/api/agent/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: message,
        reset_conversation: resetConversation,
      }),
    });

    if (!response.ok) {
      throw new Error(`Python server responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Format the response for the chat interface
    let aiResponse = '';

    if (data.matches && data.matches.length > 0) {
      // Format candidate results
      aiResponse = `I found ${data.matches_found} candidates matching your criteria:\n\n`;

      data.matches.slice(0, 3).forEach((match: any, index: number) => {
        aiResponse += `${index + 1}. **${match.name}**\n`;
        aiResponse += `   - Score: ${match.score}%\n`;
        aiResponse += `   - Skills: ${match.matched_skills.join(', ')}\n`;
        aiResponse += `   - Experience: ${match.experience_years} years (${match.experience_level})\n`;
        aiResponse += `   - Email: ${match.email}\n`;
        aiResponse += `   - Phone: ${match.phone}\n\n`;
      });

      if (data.matches_found > 3) {
        aiResponse += `...and ${data.matches_found - 3} more candidates.\n\n`;
      }

      if (data.refinement_suggestion) {
        aiResponse += `💡 ${data.refinement_suggestion}`;
      }
    } else {
      aiResponse = "I couldn't find any candidates matching your criteria. Try broadening your search or using different keywords.";
    }

    return NextResponse.json({
      response: aiResponse,
      conversationTurn: data.conversation_turn,
      combinedFilters: data.combined_filters,
      matchesFound: data.matches_found,
      candidates: data.matches || []
    });

  } catch (error) {
    console.error('Error calling conversation agent:', error);

    // Fallback response
    return NextResponse.json({
      response: "I'm sorry, I'm having trouble connecting to the candidate database right now. Please try again in a moment.",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}