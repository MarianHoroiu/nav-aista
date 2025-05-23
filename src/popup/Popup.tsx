import React, { useState } from 'react';

import { ThemeToggle } from '../components/common';
import {
  AnalyzeDropdownsMessage,
  AnalyzeDropdownsResponse,
  DropdownAnalysis,
} from '../types/chrome-extension';

// Date range options for publication date
type DateRangeOption = 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'this-year';

const Popup: React.FC = () => {
  const [dropdowns, setDropdowns] = useState<DropdownAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeOption>('this-month');

  // Helper function to calculate the start date based on selected range
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const calculateStartDate = (option: DateRangeOption): string => {
    const today = new Date();
    let startDate: Date;

    switch (option) {
      case 'this-week': {
        // Find Monday of current week
        const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        startDate = new Date(today.setDate(diff));
        break;
      }
      case 'last-week': {
        // Find Monday of previous week
        const day = today.getDay();
        const diff = today.getDate() - day - 6 + (day === 0 ? -6 : 1); // Go back 1 week + adjust for Sunday
        startDate = new Date(today.setDate(diff));
        break;
      }
      case 'this-month':
        // First day of current month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'last-month':
        // First day of previous month
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        break;
      case 'this-year':
        // January 1st of current year
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        // Default to first day of current month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    // Format as MM/DD/YYYY (Kendo datepicker format)
    return `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear()}`;
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
            // Check for chrome runtime errors (which could indicate content script not loaded)
            const error = chrome.runtime.lastError;
            if (error) {
              setIsAnalyzing(false);
              return;
            }

            setIsAnalyzing(false);

            if (response && response.dropdowns) {
              setDropdowns(response.dropdowns);
            }
          }
        );
      } else {
        setIsAnalyzing(false);
      }
    });
  };

  return (
    <div className="border-secondary-200 dark:border-secondary-800 rounded-lg px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Nav-AISTA</h1>
        <ThemeToggle />
      </div>

      <div className="mb-4">
        <button
          onClick={analyzeDropdowns}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Page Form'}
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
            {`Click "Analyze Form Page" to scan the current page form <Select /> elements.`}
          </div>
        )
      )}

      {/* Date Range Selection Card */}
      <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">Publication Date Range</h2>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="dateRange"
              value="this-week"
              checked={dateRange === 'this-week'}
              onChange={() => setDateRange('this-week')}
              className="mr-2"
            />
            <span>This week (from Monday)</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="dateRange"
              value="last-week"
              checked={dateRange === 'last-week'}
              onChange={() => setDateRange('last-week')}
              className="mr-2"
            />
            <span>Last week (from Monday)</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="dateRange"
              value="this-month"
              checked={dateRange === 'this-month'}
              onChange={() => setDateRange('this-month')}
              className="mr-2"
            />
            <span>This month (from 1st)</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="dateRange"
              value="last-month"
              checked={dateRange === 'last-month'}
              onChange={() => setDateRange('last-month')}
              className="mr-2"
            />
            <span>Last month (from 1st)</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="dateRange"
              value="this-year"
              checked={dateRange === 'this-year'}
              onChange={() => setDateRange('this-year')}
              className="mr-2"
            />
            <span>This year (from Jan 1st)</span>
          </label>
        </div>
      </div>

      <footer className="mt-auto text-center text-sm text-secondary-500 dark:text-secondary-400 pt-2">
        <p>Naval AI Search Tool for Auctions v0.1.0</p>
      </footer>
    </div>
  );
};

export default Popup;
