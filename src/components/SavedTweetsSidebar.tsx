import React, { useEffect, useState } from 'react';
import { SavedTweet, getSavedTweets, deleteSavedTweet } from '../services/supabase';

interface SavedTweetsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface GroupedTweets {
  [caseId: string]: {
    tweets: SavedTweet[];
    originalPrompt: string;
    isExpanded: boolean;
    showFullCase: boolean;
  };
}

export const SavedTweetsSidebar: React.FC<SavedTweetsSidebarProps> = ({ isOpen, onToggle }) => {
  const [groupedTweets, setGroupedTweets] = useState<GroupedTweets>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSavedTweets();
    }
  }, [isOpen]);

  const loadSavedTweets = async () => {
    setLoading(true);
    const tweets = await getSavedTweets();
    
    // Group tweets by case_id
    const grouped = tweets.reduce((acc: GroupedTweets, tweet) => {
      if (!acc[tweet.case_id]) {
        acc[tweet.case_id] = {
          tweets: [],
          originalPrompt: tweet.original_prompt,
          isExpanded: true,
          showFullCase: false
        };
      }
      acc[tweet.case_id].tweets.push(tweet);
      return acc;
    }, {});

    setGroupedTweets(grouped);
    setLoading(false);
  };

  const handleDelete = async (id: string, caseId: string) => {
    const success = await deleteSavedTweet(id);
    if (success) {
      setGroupedTweets(prev => {
        const newGrouped = { ...prev };
        newGrouped[caseId].tweets = newGrouped[caseId].tweets.filter(t => t.id !== id);
        
        // Remove the case group if no tweets left
        if (newGrouped[caseId].tweets.length === 0) {
          delete newGrouped[caseId];
        }
        
        return newGrouped;
      });
    }
  };

  const toggleCase = (caseId: string) => {
    setGroupedTweets(prev => ({
      ...prev,
      [caseId]: {
        ...prev[caseId],
        isExpanded: !prev[caseId].isExpanded
      }
    }));
  };

  const toggleFullCase = (caseId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setGroupedTweets(prev => ({
      ...prev,
      [caseId]: {
        ...prev[caseId],
        showFullCase: !prev[caseId].showFullCase
      }
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : Object.keys(groupedTweets).length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              No saved tweets yet
            </div>
          ) : (
            Object.entries(groupedTweets).map(([caseId, { tweets, originalPrompt, isExpanded, showFullCase }]) => (
              <div key={caseId} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCase(caseId)}
                  className="w-full p-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Case Summary</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {showFullCase ? originalPrompt : truncateText(originalPrompt, 100)}
                      <button
                        onClick={(e) => toggleFullCase(caseId, e)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {showFullCase ? 'Show less' : 'See more'}
                      </button>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isExpanded && (
                  <div className="p-4 space-y-4 bg-white">
                    {tweets.map((tweet) => (
                      <div
                        key={tweet.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="text-gray-800 mb-2">{tweet.tweet_content}</div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{formatDate(tweet.saved_at)}</span>
                          <button
                            onClick={() => handleDelete(tweet.id, caseId)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}; 