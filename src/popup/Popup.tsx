import React, { useState } from 'react';

import { ThemeToggle } from '../components/common';
import {
  AnalyzeDropdownsMessage,
  AnalyzeDropdownsResponse,
  AutocompleteInputsMessage,
  TriggerSearchMessage,
  DropdownAnalysis,
} from '../types/chrome-extension';

// Date range options for publication date
type DateRangeOption = 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'this-year';

// Target labels that we're looking for
const TARGET_LABELS = [
  'Autoritatea contractanta',
  'Domeniu de activitate',
  'Modalitatea de atribuire',
  'Cod sau denumire CPV',
];

const Popup: React.FC = () => {
  const [dropdowns, setDropdowns] = useState<DropdownAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [autocompleteStatus, setAutocompleteStatus] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRangeOption>('this-month');

  // Helper function to calculate the start date based on selected range
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
    setAnalysisStatus('Initializing dropdown analysis...');

    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0];

      if (activeTab?.id) {
        setAnalysisStatus(`Looking for target dropdowns: ${TARGET_LABELS.join(', ')}...`);

        // Send message to content script
        const message: AnalyzeDropdownsMessage = {
          action: 'analyzeDropdowns',
        };

        chrome.tabs.sendMessage<AnalyzeDropdownsMessage, AnalyzeDropdownsResponse>(
          activeTab.id,
          message,
          response => {
            // Check for chrome runtime errors (which could indicate content script not loaded)
            const error = chrome.runtime.lastError;
            if (error) {
              setIsAnalyzing(false);
              setAnalysisStatus('Error: Content script not loaded');
              return;
            }

            setIsAnalyzing(false);

            if (response && response.dropdowns) {
              setDropdowns(response.dropdowns);

              // Count target dropdowns by matching the title with target labels
              const targetDropdowns = response.dropdowns.filter(d =>
                TARGET_LABELS.some(label => d.title.toLowerCase().includes(label.toLowerCase()))
              );

              setAnalysisStatus(
                `Analysis complete. Found ${targetDropdowns.length} of ${TARGET_LABELS.length} target dropdowns and ${response.dropdowns.length - targetDropdowns.length} other form fields.`
              );
            } else {
              setAnalysisStatus('No dropdowns found or analysis failed');
            }
          }
        );
      } else {
        setIsAnalyzing(false);
        setAnalysisStatus('Error: No active tab found');
      }
    });
  };

  // Function to trigger input autocomplete
  const triggerAutocomplete = () => {
    setAutocompleteStatus('Initializing autocomplete...');

    // Calculate the start date based on selected option
    const startDate = calculateStartDate(dateRange);

    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0];

      if (activeTab?.id) {
        // First send message to autocomplete inputs with the selected date range
        const autocompleteMessage: AutocompleteInputsMessage = {
          action: 'autocompleteInputs',
          startDate: startDate, // Pass the calculated start date
        };

        chrome.tabs.sendMessage(activeTab.id, autocompleteMessage, response => {
          // Check for chrome runtime errors
          const error = chrome.runtime.lastError;
          if (error) {
            setAutocompleteStatus('Error: Content script not loaded');
            return;
          }

          if (response && response.success) {
            // Enhance the status message to mention the date fields
            const fieldCount = response.message
              ? response.message.match(/(\d+) of (\d+)/)?.[1] || '0'
              : '0';

            setAutocompleteStatus(
              `Filling form fields: ${fieldCount} fields including estimated value and publication date range (${dateRange}). ${response.message || ''}`
            );

            // After form fields are filled, trigger the search/filter button
            setTimeout(() => {
              const searchMessage: TriggerSearchMessage = {
                action: 'triggerSearch',
              };

              chrome.tabs.sendMessage(activeTab.id, searchMessage, searchResponse => {
                if (chrome.runtime.lastError) {
                  setAutocompleteStatus(
                    `Form filled but search failed: ${chrome.runtime.lastError.message}`
                  );
                  return;
                }

                if (searchResponse && searchResponse.success) {
                  setAutocompleteStatus(`Form filled and search triggered successfully`);
                } else {
                  setAutocompleteStatus(
                    `Form filled but search failed: ${searchResponse?.message || 'Unknown error'}`
                  );
                }
              });
            }, 500); // Small delay to ensure form is filled before triggering search
          } else {
            setAutocompleteStatus(`Autocomplete failed: ${response?.message || 'Unknown error'}`);
          }
        });
      } else {
        setAutocompleteStatus('Error: No active tab found');
      }
    });
  };

  return (
    <div className="border-secondary-200 dark:border-secondary-800 rounded-lg px-4 py-4 space-y-4 w-96">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Nav-AISTA</h1>
        <ThemeToggle />
      </div>

      <div className="mb-4 space-y-2">
        <button
          onClick={analyzeDropdowns}
          disabled={isAnalyzing}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isAnalyzing ? 'Analyzing...' : 'Trigger Search Dropdowns'}
        </button>

        {analysisStatus && <div className="text-sm text-gray-600">{analysisStatus}</div>}
      </div>

      {/* New Date Range Selection Card */}
      <div className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Publication Date Range</h2>

        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-2">Select the start date for publication range:</p>

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

        <button
          onClick={triggerAutocomplete}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Autocomplete Form Fields
        </button>

        {autocompleteStatus && (
          <div className="text-sm text-gray-600 mt-2">{autocompleteStatus}</div>
        )}
      </div>

      {dropdowns.length > 0 ? (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Found {dropdowns.length} Dropdowns</h2>

          <div className="overflow-y-auto max-h-96">
            {dropdowns.map((dropdown, index) => (
              <div key={index} className="mb-4 p-3 border border-gray-200 rounded">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{dropdown.title}</h3>
                  <div className="flex space-x-1">
                    {dropdown.isKendo && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded">
                        Kendo UI
                      </span>
                    )}
                    {TARGET_LABELS.some(label =>
                      dropdown.title.toLowerCase().includes(label.toLowerCase())
                    ) && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                        Target Field
                      </span>
                    )}
                  </div>
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
        !isAnalyzing &&
        !analysisStatus && (
          <div className="text-gray-600">
            {`Click "Trigger Search Dropdowns" to analyze and load specific dropdown fields on the page.`}
          </div>
        )
      )}

      <footer className="mt-auto text-center text-sm text-secondary-500 dark:text-secondary-400 pt-2">
        <p>Naval AI Search Tool for Auctions v0.1.0</p>
      </footer>
    </div>
  );
};

export default Popup;
