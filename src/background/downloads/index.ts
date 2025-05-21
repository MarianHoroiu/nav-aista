/**
 * Downloads Management for Background Service Worker
 *
 * This module provides utilities for downloading documents:
 * - PDF documents
 * - Archive files (ZIP, RAR)
 * - Document metadata handling
 */

import eventEmitter from '../events';
import { Message, MessageAction, MessageResponse } from '../messaging';
import { getStorageItem, setStorageItem } from '../storage';

// Download events
export enum DownloadEvent {
  STARTED = 'download:started',
  COMPLETED = 'download:completed',
  FAILED = 'download:failed',
  PROGRESS = 'download:progress',
}

// Download mime types
export enum MimeType {
  PDF = 'application/pdf',
  ZIP = 'application/zip',
  RAR = 'application/x-rar-compressed',
  GENERIC = 'application/octet-stream',
}

// Download file information
export interface DownloadFile {
  id: string;
  url: string;
  filename: string;
  mimeType: MimeType | string;
  size?: number;
  metadata?: Record<string, unknown>;
}

// Download status information
export interface DownloadStatus {
  downloadId?: number;
  state: 'in_progress' | 'completed' | 'interrupted' | 'cancelled';
  bytesReceived: number;
  totalBytes?: number;
  error?: string;
}

// Message data from event emitter
interface MessageEventData {
  message: Message;
  sender: chrome.runtime.MessageSender;
  sendResponse: (response: MessageResponse) => void;
}

// Collection of active downloads
const activeDownloads: Map<string, number> = new Map();

/**
 * Initialize downloads management
 */
export function initializeDownloads(): void {
  // Request downloads permission if needed
  checkAndRequestPermissions();

  // Track download status changes
  if (chrome.downloads) {
    chrome.downloads.onChanged.addListener(delta => {
      handleDownloadChanged(delta);
    });
  }

  // Register message handlers for download requests
  registerMessageHandlers();
}

/**
 * Check and request necessary permissions
 */
async function checkAndRequestPermissions(): Promise<void> {
  // Check if we have downloads permission
  try {
    const hasPermission = await chrome.permissions.contains({
      permissions: ['downloads'],
    });

    if (!hasPermission) {
      console.log('Downloads permission not granted, functionality limited');
    } else {
      console.log('Downloads permission granted');
    }
  } catch (error) {
    console.error('Error checking download permissions:', error);
  }
}

/**
 * Register message handlers for download-related messages
 */
function registerMessageHandlers(): void {
  // Listen for download messages on the event bus
  eventEmitter.on(`message:${MessageAction.DOWNLOAD_DOCUMENT}`, async (data: MessageEventData) => {
    const { message, sendResponse } = data;

    if (message.payload && typeof message.payload === 'object') {
      try {
        const downloadInfo = message.payload as DownloadFile;
        const downloadId = await downloadFile(downloadInfo);

        sendResponse({
          success: true,
          data: {
            downloadId,
            message: 'Download started',
          },
        });
      } catch (error) {
        console.error('Error starting download:', error);
        sendResponse({
          success: false,
          error: `Failed to start download: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    } else {
      sendResponse({
        success: false,
        error: 'Invalid download information provided',
      });
    }
  });
}

/**
 * Handle download status changes
 * @param delta The download status change delta
 */
function handleDownloadChanged(delta: chrome.downloads.DownloadDelta): void {
  // Find download ID in our active downloads
  let fileId: string | undefined;

  for (const [id, downloadId] of activeDownloads.entries()) {
    if (downloadId === delta.id) {
      fileId = id;
      break;
    }
  }

  if (!fileId) return;

  // Get download info to have the most accurate state
  chrome.downloads.search({ id: delta.id }, downloads => {
    if (downloads.length === 0) return;

    const download = downloads[0];

    // Create status object from current download state
    const status: DownloadStatus = {
      downloadId: download.id,
      state: download.state as 'in_progress' | 'completed' | 'interrupted' | 'cancelled',
      bytesReceived: download.bytesReceived || 0,
      totalBytes: download.totalBytes,
      error: download.error,
    };

    // Handle different states
    switch (download.state) {
      case 'complete':
        activeDownloads.delete(fileId);
        eventEmitter.emit(DownloadEvent.COMPLETED, { fileId, status });
        updateDownloadHistory(fileId, status);
        break;

      case 'interrupted':
        activeDownloads.delete(fileId);
        eventEmitter.emit(DownloadEvent.FAILED, { fileId, status });
        updateDownloadHistory(fileId, status);
        break;

      case 'in_progress':
        eventEmitter.emit(DownloadEvent.PROGRESS, { fileId, status });
        break;

      default:
        // Other states like 'cancelled'
        eventEmitter.emit(DownloadEvent.PROGRESS, { fileId, status });
        break;
    }
  });
}

/**
 * Download a file
 * @param file The file information
 * @returns Promise resolving to the download ID
 */
export async function downloadFile(file: DownloadFile): Promise<string> {
  if (!chrome.downloads) {
    throw new Error('Downloads API not available');
  }

  // Generate a unique ID if not provided
  const fileId = file.id || generateUniqueId();

  try {
    // Create download options
    const options: chrome.downloads.DownloadOptions = {
      url: file.url,
      filename: file.filename,
      saveAs: false,
    };

    // Start the download
    const downloadId = await new Promise<number>((resolve, reject) => {
      chrome.downloads.download(options, id => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (id === undefined) {
          reject(new Error('Download failed to start'));
        } else {
          resolve(id);
        }
      });
    });

    // Store download information
    activeDownloads.set(fileId, downloadId);

    // Emit download started event
    eventEmitter.emit(DownloadEvent.STARTED, {
      fileId,
      downloadId,
      file,
    });

    return fileId;
  } catch (error) {
    console.error('Error starting download:', error);
    eventEmitter.emit(DownloadEvent.FAILED, {
      fileId,
      error,
    });
    throw error;
  }
}

/**
 * Cancel an active download
 * @param fileId The file ID to cancel
 * @returns Promise resolving to true if cancelled
 */
export async function cancelDownload(fileId: string): Promise<boolean> {
  const downloadId = activeDownloads.get(fileId);

  if (!downloadId || !chrome.downloads) {
    return false;
  }

  return new Promise<boolean>(resolve => {
    chrome.downloads.cancel(downloadId, () => {
      const success = !chrome.runtime.lastError;

      if (success) {
        activeDownloads.delete(fileId);
      }

      resolve(success);
    });
  });
}

/**
 * Update download history in storage
 * @param fileId The file ID
 * @param status The download status
 */
async function updateDownloadHistory(fileId: string, status: DownloadStatus): Promise<void> {
  try {
    // Get existing download history
    const history = (await getStorageItem<Array<Record<string, unknown>>>('downloadHistory')) || [];

    // Find existing entry or create new one
    const existingIndex = history.findIndex(item => item.fileId === fileId);

    const historyItem = {
      fileId,
      status,
      timestamp: Date.now(),
    };

    if (existingIndex >= 0) {
      history[existingIndex] = historyItem;
    } else {
      history.push(historyItem);
    }

    // Keep only the latest 100 entries
    const trimmedHistory = history.slice(-100);

    // Update storage
    await setStorageItem('downloadHistory', trimmedHistory);
  } catch (error) {
    console.error('Error updating download history:', error);
  }
}

/**
 * Generate a unique ID for a download
 * @returns A unique ID string
 */
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
