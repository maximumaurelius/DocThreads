import React, { useEffect, useState } from 'react';
import { SavedTweet, getSavedTweets, deleteSavedTweet } from '../services/supabase';

interface SavedTweetsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const SavedTweetsSidebar: React.FC<SavedTweetsSidebarProps> = ({ isOpen, onToggle }) => {
  const [savedTweets, setSavedTweets] = useState<SavedTweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedTweets();
  }, []);

  const loadSavedTweets = async () => {
    setLoading(true);
    const tweets = await getSavedTweets();
    setSavedTweets(tweets);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteSavedTweet(id);
    if (success) {
      setSavedTweets(tweets => tweets.filter(t => t.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-xl transition-all duration-300 transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ width: '400px', zIndex: 1000 }}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600">
          <h2 className="text-xl font-semibold text-white">Saved Tweets</h2>
          <button
            onClick={onToggle}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : savedTweets.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              No saved tweets yet
            </div>
          ) : (
            savedTweets.map((tweet) => (
              <div
                key={tweet.id}
                className="bg-white rounded-lg border border-gray-200 p-4 group relative hover:shadow-md transition-shadow"
              >
                <div className="text-gray-800 mb-2">{tweet.tweet_content}</div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{formatDate(tweet.saved_at)}</span>
                  <button
                    onClick={() => handleDelete(tweet.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
                
                {/* Hover tooltip for original prompt */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2 bg-gray-800 text-white p-2 rounded-md text-sm w-64 pointer-events-none">
                  <strong>Original Prompt:</strong>
                  <p className="mt-1">{tweet.original_prompt}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}; 