import React, { useState } from 'react';

import { Card } from '../components/common';
import { AnalyzeDropdownsMessage, AnalyzeDropdownsResponse } from '../types/chrome-extension';

// Interface for dropdown analysis results
interface DropdownOption {
  value: string;
  text: string;
  selected: boolean;
}

interface DropdownAnalysis {
  element?: HTMLSelectElement;
  title: string;
  id: string | null;
  name: string;
  options: DropdownOption[];
}

const Popup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdowns, setDropdowns] = useState<DropdownAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulating a loading state
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Function to trigger dropdown analysis
  const analyzeDropdowns = () => {
    setIsAnalyzing(true);
    setDropdowns([]);

    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0];

      if (activeTab?.id) {
        // Send message to content script
        chrome.tabs.sendMessage<AnalyzeDropdownsMessage, AnalyzeDropdownsResponse>(
          activeTab.id,
          { action: 'analyzeDropdowns' },
          response => {
            setIsAnalyzing(false);

            if (response && response.dropdowns) {
              setDropdowns(response.dropdowns);
            } else {
              console.error('No dropdown data received');
            }
          }
        );
      } else {
        setIsAnalyzing(false);
        console.error('No active tab found');
      }
    });
  };

  return (
    <div className="border-secondary-200 dark:border-secondary-800 rounded-lg px-4 py-4 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Naval Auction Assistant</h1>

      <Card>
        <div className="p-4 space-y-2">
          <h2 className="text-xl font-semibold">Search Auctions</h2>
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              placeholder="Enter keywords..."
              className="w-full p-2 border rounded"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full p-2 bg-blue-600 text-white rounded disabled:bg-blue-300"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      </Card>

      <div className="mb-4">
        <button
          onClick={analyzeDropdowns}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Dropdowns'}
        </button>
      </div>

      {dropdowns.length > 0 ? (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Found {dropdowns.length} Dropdowns</h2>
          <div className="overflow-y-auto max-h-96">
            {dropdowns.map((dropdown, index) => (
              <div key={index} className="mb-4 p-3 border border-gray-200 rounded">
                <h3 className="font-medium">{dropdown.title}</h3>
                <div className="text-sm text-gray-600">
                  ID: {dropdown.id || 'none'} | Name: {dropdown.name || 'none'}
                </div>
                <div className="mt-2">
                  <div className="text-sm font-medium">Options ({dropdown.options.length}):</div>
                  <ul className="ml-2 text-sm">
                    {dropdown.options.map((option, optIdx) => (
                      <li key={optIdx} className={option.selected ? 'font-bold' : ''}>
                        {option.text} ({option.value}){option.selected && ' ✓'}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        !isAnalyzing && (
          <div className="text-gray-600">
            Click "Analyze Dropdowns" to scan the current page for dropdown elements.
          </div>
        )
      )}

      <footer className="mt-auto text-center text-sm text-secondary-500 dark:text-secondary-400 pt-2">
        <p>Naval Auction Assistant v0.1.0</p>
      </footer>
    </div>
  );
};

export default Popup;
