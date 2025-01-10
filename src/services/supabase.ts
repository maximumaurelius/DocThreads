import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface SavedTweet {
  id: string;
  tweet_content: string;
  original_prompt: string;
  saved_at: string;
  case_id: string;
}

export const saveTweet = async (
  tweetContent: string,
  originalPrompt: string,
  caseId: string
): Promise<SavedTweet | null> => {
  const { data, error } = await supabase
    .from('saved_tweets')
    .insert([
      {
        tweet_content: tweetContent,
        original_prompt: originalPrompt,
        case_id: caseId,
        saved_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving tweet:', error);
    return null;
  }

  return data;
};

export const getSavedTweets = async (): Promise<SavedTweet[]> => {
  const { data, error } = await supabase
    .from('saved_tweets')
    .select('*')
    .order('saved_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved tweets:', error);
    return [];
  }

  return data || [];
};

export const deleteSavedTweet = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('saved_tweets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting tweet:', error);
    return false;
  }

  return true;
}; 