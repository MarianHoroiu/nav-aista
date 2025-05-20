import React, { useState, useEffect } from 'react';

import { Button, Card, Input, ThemeToggle } from '@components/common';

interface SettingsType {
  notificationsEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  darkMode: boolean;
}

const Options: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType>({
    notificationsEnabled: true,
    autoRefresh: false,
    refreshInterval: 15,
    darkMode: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load settings on component mount
  useEffect(() => {
    chrome.storage.sync.get(settings, items => {
      setSettings(items as SettingsType);
    });
  }, []);

  // Save settings when changed
  const handleSave = () => {
    setIsSaving(true);
    setSaveMessage('');

    chrome.storage.sync.set(settings, () => {
      setIsSaving(false);
      setSaveMessage('Settings saved successfully!');

      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    });
  };

  return (
    <div className="extension-options p-6 bg-white dark:bg-secondary-900 min-h-screen">
      <header className="flex items-center justify-between mb-8 border-b pb-4 border-secondary-200 dark:border-secondary-700">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Naval Auction Assistant - Settings
        </h1>
        <ThemeToggle />
      </header>

      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-secondary-900 dark:text-white">
            Notification Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notificationsEnabled"
                className="w-4 h-4 text-primary-500 border-secondary-300 rounded focus:ring-primary-500 dark:border-secondary-600"
                checked={settings.notificationsEnabled}
                onChange={e => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
              />
              <label
                htmlFor="notificationsEnabled"
                className="ml-2 text-secondary-800 dark:text-secondary-200"
              >
                Enable Notifications
              </label>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-secondary-900 dark:text-white">
            Auction Page Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRefresh"
                className="w-4 h-4 text-primary-500 border-secondary-300 rounded focus:ring-primary-500 dark:border-secondary-600"
                checked={settings.autoRefresh}
                onChange={e => setSettings({ ...settings, autoRefresh: e.target.checked })}
              />
              <label
                htmlFor="autoRefresh"
                className="ml-2 text-secondary-800 dark:text-secondary-200"
              >
                Auto-refresh Auction Pages
              </label>
            </div>

            {settings.autoRefresh && (
              <div className="pl-6 mt-2">
                <Input
                  label="Refresh Interval (minutes)"
                  type="number"
                  min="5"
                  max="60"
                  value={settings.refreshInterval.toString()}
                  onChange={e =>
                    setSettings({ ...settings, refreshInterval: Number(e.target.value) })
                  }
                />
              </div>
            )}
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <Button onClick={handleSave} isLoading={isSaving}>
            Save Settings
          </Button>

          {saveMessage && <p className="text-green-600 dark:text-green-400 ml-4">{saveMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default Options;
