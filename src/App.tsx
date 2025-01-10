import { useState } from 'react'
import React from 'react'
import { ClaudeService } from './services/claude'

function App() {
  const [caseReport, setCaseReport] = useState('')
  const [tweets, setTweets] = useState<string[]>([])
  const [focusArea, setFocusArea] = useState<'learning_points' | 'pathophysiology' | 'both'>('both')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const handleGenerateTweets = async () => {
    setIsLoading(true)
    setError(undefined)
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
        <h1 className="text-4xl font-extrabold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          Content Remixer
        </h1>
        <p className="text-center text-gray-600 mb-12">Transform your content with AI-powered creativity</p>
        
        <div className="space-y-8 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="transition-all duration-200">
            <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
              Input Text
            </label>
            <textarea
              id="input"
              rows={6}
              className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 resize-none"
              placeholder="Paste your text here..."
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
                        <div className="flex flex-col w-full">
                          <div className="flex justify-between items-start gap-4">
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
                            <button
                              className="ml-4 px-4 py-1 bg-[#1DA1F2] text-white rounded-full hover:bg-[#1a8cd8] transition-colors flex-shrink-0"
                              onClick={() => {/* Tweet functionality will be added later */}}
                            >
                              Tweet
                            </button>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            {280 - tweet.length} characters remaining
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {tweets.includes('Pick the vibe') && (
                <p className="mt-3 text-sm text-gray-600 italic">
                  Pick the vibe that resonates with you! I aimed to maintain the enthusiastic spirit while polishing the spelling and adding some flair.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
