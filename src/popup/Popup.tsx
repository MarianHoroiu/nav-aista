import React, { useState } from 'react';

import { Button, Card, Input, ThemeToggle } from '@components/common';

const Popup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Here you would typically handle the search
      // TODO: Implement search functionality
    }, 1000);
  };

  return (
    <div className="extension-popup p-4 bg-white dark:bg-secondary-900 min-h-full">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-secondary-900 dark:text-white">
          Naval Auction Assistant
        </h1>
        <ThemeToggle />
      </header>

      <Card className="mb-4">
        <h2 className="text-lg font-semibold mb-2 text-secondary-900 dark:text-white">
          Quick Search
        </h2>

        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Search auctions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="mb-3"
          />

          <Button type="submit" isLoading={loading} fullWidth>
            Search
          </Button>
        </form>
      </Card>

      <Card variant="outlined" className="mb-4">
        <h2 className="text-lg font-semibold mb-2 text-secondary-900 dark:text-white">
          Recent Notifications
        </h2>
        <div className="space-y-2">
          <p className="text-sm text-secondary-700 dark:text-secondary-300">
            No new notifications.
          </p>
        </div>
      </Card>

      <footer className="mt-auto text-center text-sm text-secondary-500 dark:text-secondary-400 pt-2">
        <Button
          variant="text"
          size="sm"
          onClick={() => {
            // Open options page
            if (chrome?.runtime?.openOptionsPage) {
              chrome.runtime.openOptionsPage();
            }
          }}
        >
          Open Settings
        </Button>
      </footer>
    </div>
  );
};

export default Popup;
