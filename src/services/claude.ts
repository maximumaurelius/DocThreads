import Anthropic from '@anthropic-ai/sdk';

// Types for our remix request/response
export interface RemixRequest {
  content: string;
  style?: string;
  temperature?: number;
}

export interface RemixResponse {
  remixedContent: string;
  error?: string;
}

// Claude service class
export class ClaudeService {
  private anthropic: Anthropic;

  constructor() {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key is not set in environment variables');
    }
    this.anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async remixContent({ content, style = 'creative', temperature = 1 }: RemixRequest): Promise<RemixResponse> {
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        temperature,
        messages: [{
          role: 'user',
          content: `Please remix the following content in a ${style} style. Here's the content: ${content}`
        }]
      });

      // Get the response text from the message
      const remixedContent = message.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n\n');

      return {
        remixedContent: remixedContent || 'No text response received'
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