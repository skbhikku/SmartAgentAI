import axios from 'axios';
import KnowledgeBase from '../models/KnowledgeBase.js';


class AIService {
  async analyzeTicket(ticket) {
  try {
    // Get relevant KB articles
    const kbArticles = await this.getRelevantKBArticles(ticket.category);

    // Check if KB articles exist
    let initialConfidence = 0.85;
    let requiresHumanReview = false;
    if (!kbArticles || kbArticles.length === 0) {
      initialConfidence = 0.3; // low confidence since no articles found
      requiresHumanReview = true;
      ticket.status = 'in-progress'; // set ticket progress
      // optionally, you can also save it to DB here
      // await ticket.save();
    }

    // Prepare context for AI
    const context = this.buildContext(ticket, kbArticles);

    // Call Mistral AI
    const response = await this.callMistralAPI(context);

    // Parse response
    const parsedResponse = this.parseAIResponse(response);

    // Override confidence and requiresHumanReview if no articles
    if (!kbArticles || kbArticles.length === 0) {
      parsedResponse.confidence = initialConfidence;
      parsedResponse.requiresHumanReview = requiresHumanReview;
    }

    return parsedResponse;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error('Failed to analyze ticket with AI');
  }
}


  async getRelevantKBArticles(category) {
    return await KnowledgeBase.find({
      category,
      isActive: true,
    })
      .limit(10)
      .lean();
  }

  buildContext(ticket, kbArticles) {
    const kbContent = kbArticles
      .map(
        (article) =>
          `Title: ${article.title}\nContent: ${article.content}`
      )
      .join('\n\n');

    return {
      ticket: {
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
      },
      knowledgeBase: kbContent,
      instruction: `
        Analyze the following support ticket and provide a helpful response based on the knowledge base articles provided.
        
        Return your response as a JSON object with the following structure:
        {
        {
  "response": "Thank you for reaching out regarding your billing issue. I understand that you have successfully made a payment, but it is not reflecting in your account dashboard. Here are the steps to resolve this issue:\\n1. Refresh the Page: Sometimes, the dashboard may not update immediately. Please refresh the page to see if the payment appears.\\n2. Check Transaction History: Navigate to the 'Transaction History' section in your account to see if the payment is listed there.\\n3. Clear Cache and Cookies: Clear your browser's cache and cookies, then log in again to see if the payment is reflected.\\n4. Contact Support: If the issue persists, please contact our support team with the transaction details, including the date, time, and amount paid. We will investigate further.\\n5. Check Email Confirmation: Verify your email inbox for a payment confirmation email. This can provide additional details about the transaction.",
}

          "confidence": 0.85 based on your analysis (0.0 to 1.0),
          "reasoning": "Brief explanation of why you have this confidence level",
          "suggestedActions": ["action1", "action2"],
          "requiresHumanReview": false
        }
        
        Confidence should be between 0.0 and 1.0:
        - 0.8-1.0: High confidence (can auto-resolve)
        - 0.5-0.79: Medium confidence (requires review)
        - 0.0-0.49: Low confidence (needs human agent)
      `,
    };
  }

  async callMistralAPI(context) {
    const payload = {
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'system',
          content: context.instruction,
        },
        {
          role: 'user',
          content: `
            Ticket Details:
            Title: ${context.ticket.title}
            Description: ${context.ticket.description}
            Category: ${context.ticket.category}
            Priority: ${context.ticket.priority}
            
            Knowledge Base Articles:
            ${context.knowledgeBase}
          `,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    };

    const response = await axios.post(process.env.MISTRAL_API_URI, payload, {
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  parseAIResponse(apiResponse) {
  try {
    const content = apiResponse.choices[0].message.content;

    // Extract JSON block
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in AI response");
    }

    // Clean up bad control characters (like \n, \t, \r)
    const cleaned = jsonMatch[0].replace(/[\u0000-\u001F]+/g, "");

    const parsed = JSON.parse(cleaned);

    // Validate required fields
    if (!parsed.response || typeof parsed.confidence !== "number") {
      throw new Error("Invalid AI response format");
    }

    // Ensure confidence stays between 0 and 1
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));

    return {
      response: parsed.response,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning || "No reasoning provided",
      suggestedActions: parsed.suggestedActions || [],
      requiresHumanReview: parsed.requiresHumanReview ?? true,
    };
  } catch (error) {
    console.error("Error parsing AI response:", error);

    // Fallback response so your app doesn’t crash
    return {
      response: apiResponse?.choices?.[0]?.message?.content || "AI response unavailable",
      confidence: 0.5,
      reasoning: "Could not parse structured response",
      suggestedActions: [],
      requiresHumanReview: true,
    };
  }
}

}

export default new AIService();
