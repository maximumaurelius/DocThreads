import Anthropic from '@anthropic-ai/sdk';

// Types for our remix request/response
export interface RemixRequest {
  content: string;
  style?: string;
}

export interface RemixResponse {
  remixedContent: string;
  error?: string;
}

// Claude service class
export class ClaudeService {
  private client: Anthropic;

  constructor() {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key is not set in environment variables');
    }
    this.client = new Anthropic({
      apiKey,
    });
  }

  async remixContent({ content, style = 'creative' }: RemixRequest): Promise<RemixResponse> {
    try {
      const message = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Please remix the following content in a ${style} style. Here's the content: ${content}`
        }]
      });

      // Get the response text from the message
      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : 'No text response received';

      return {
        remixedContent: responseText
      };
    } catch (error) {
      console.error('Error remixing content:', error);
      return {
        remixedContent: '',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
} 