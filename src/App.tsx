import { useState } from 'react'
import { ClaudeService } from './services/claude'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const handleRemix = async () => {
    setIsLoading(true)
    setError(undefined)
    try {
      const claudeService = new ClaudeService()
      const response = await claudeService.remixContent({ content: inputText })
      
      if (response.error) {
        setError(response.error)
      } else {
        setOutputText(response.remixedContent)
      }
    } catch (error) {
      console.error('Error remixing content:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Content Remixer</h1>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="input" className="block text-sm font-medium text-gray-700">
              Input Text
            </label>
            <textarea
              id="input"
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Paste your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <button
            onClick={handleRemix}
            disabled={isLoading || !inputText}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isLoading ? 'Remixing...' : 'Remix Content'}
          </button>

          {error && (
            <div className="text-red-600 text-sm">
              Error: {error}
            </div>
          )}

          {outputText && (
            <div>
              <label htmlFor="output" className="block text-sm font-medium text-gray-700">
                Remixed Output
              </label>
              <textarea
                id="output"
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-white"
                value={outputText}
                readOnly
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
