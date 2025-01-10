import { useState, useEffect } from 'react'
import React from 'react'
import { ClaudeService } from './services/claude'
import { saveTweet } from './services/supabase'
import { SavedTweetsSidebar } from './components/SavedTweetsSidebar'
import { v4 as uuidv4 } from 'uuid'

function App() {
  const [caseReport, setCaseReport] = useState('')
  const [tweets, setTweets] = useState<string[]>([])
  const [focusArea, setFocusArea] = useState<'learning_points' | 'pathophysiology' | 'both'>('both')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Get the saved preference from localStorage, default to false
    const saved = localStorage.getItem('savedTweetsSidebarOpen')
    return saved ? JSON.parse(saved) : false
  })
  const [currentCaseId, setCurrentCaseId] = useState<string>('')

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('savedTweetsSidebarOpen', JSON.stringify(isSidebarOpen))
  }, [isSidebarOpen])

  const handleTweetClick = (tweet: string) => {
    const tweetText = encodeURIComponent(tweet);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  const handleSaveTweet = async (tweet: string) => {
    if (!currentCaseId) return;
    
    try {
      await saveTweet(tweet, caseReport, currentCaseId);
      // Show success message
      const notification = document.getElementById('save-notification');
      if (notification) {
        notification.classList.remove('opacity-0');
        setTimeout(() => {
          notification.classList.add('opacity-0');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving tweet:', error);
      setError('Failed to save tweet');
    }
  };

  const handleGenerateTweets = async () => {
    setIsLoading(true)
    setError(undefined)
    // Generate a new case ID for this batch of tweets
    setCurrentCaseId(uuidv4())
    
    try {
      const claudeService = new ClaudeService()
      const response = await claudeService.generateMedicalTweets({ 
        caseReport,
        focusArea,
        tweetCount: 3
      })
      
      if (response.error) {
        setError(response.error)
      } else {
        setTweets(response.tweets)
      }
    } catch (error) {
      console.error('Error generating tweets:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center mb-16 mt-8">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            Dr. Threads
          </h1>
          <p className="text-gray-600 text-lg">
            Transforming clinical cases into bite-sized educational threads. Simplifying medicine, one post at a time.
          </p>
          <div className="absolute top-8 right-8 flex items-center space-x-3">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-600 opacity-80">
                <path
                  fill="currentColor"
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                />
              </svg>
            </a>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg bg-white/80 hover:bg-white/90 transition-colors shadow-sm"
            >
              <span className="text-gray-600 font-medium">Saved Tweets</span>
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="space-y-8 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="transition-all duration-200">
            <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
              Clinical Case
            </label>
            <textarea
              id="input"
              rows={6}
              className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 resize-none p-4"
              placeholder="Paste your clinical case here..."
              value={caseReport}
              onChange={(e) => setCaseReport(e.target.value)}
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGenerateTweets}
              disabled={isLoading || !caseReport}
              className="px-8 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating tweets...</span>
                </div>
              ) : (
                'Generate Tweets'
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {tweets.length > 0 && (
            <div className="transition-all duration-200">
              <label htmlFor="output" className="flex text-sm font-medium text-gray-700 mb-2 items-center">
                Generated Tweets:
                <span className="ml-1">✨</span>
              </label>
              <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                {tweets.map((tweet, index) => (
                  <div key={index}>
                    <h3 className="text-gray-700 mb-3">Tweet {index + 1}:</h3>
                    {tweet && (
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex flex-col w-full h-full">
                          <div className="text-gray-800 whitespace-pre-line">
                            {tweet.split('https://').map((part, i) => 
                              i === 0 ? part : (
                                <React.Fragment key={i}>
                                  <br />
                                  {'https://' + part}
                                </React.Fragment>
                              )
                            )}
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-500">
                              {280 - tweet.length} characters remaining
                            </div>
                            <div className="flex space-x-2">
                              <button
                                className="p-1.5 bg-transparent hover:bg-gray-100 transition-colors flex-shrink-0 rounded-full"
                                onClick={() => handleSaveTweet(tweet)}
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                              </button>
                              <button
                                className="p-1.5 bg-transparent hover:bg-gray-100 transition-colors flex-shrink-0 rounded-full"
                                onClick={() => handleTweetClick(tweet)}
                              >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-black">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save notification */}
      <div
        id="save-notification"
        className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg opacity-0 transition-opacity duration-300"
      >
        Tweet saved successfully!
      </div>

      <SavedTweetsSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  )
}

export default App
