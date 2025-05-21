/**
 * Messaging Error Handling
 *
 * This file contains error handling utilities for the messaging system,
 * including custom error classes and error code definitions.
 */

/**
 * Error codes for messaging system
 */
export enum ErrorCode {
  // General errors
  UNKNOWN = 'UNKNOWN_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  INVALID_MESSAGE = 'INVALID_MESSAGE',

  // Connection errors
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  CONNECTION_CLOSED = 'CONNECTION_CLOSED',
  TARGET_UNAVAILABLE = 'TARGET_UNAVAILABLE',

  // Handler errors
  HANDLER_NOT_FOUND = 'HANDLER_NOT_FOUND',
  HANDLER_EXECUTION_ERROR = 'HANDLER_EXECUTION_ERROR',

  // Permission errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  // Content errors
  TAB_NOT_FOUND = 'TAB_NOT_FOUND',
  INJECT_SCRIPT_FAILED = 'INJECT_SCRIPT_FAILED',

  // Data errors
  INVALID_DATA = 'INVALID_DATA',
  DATA_PARSING_ERROR = 'DATA_PARSING_ERROR',

  // Authentication errors
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_FAILED = 'AUTH_FAILED',

  // Action errors
  ACTION_FAILED = 'ACTION_FAILED',
}

/**
 * Base messaging error class
 */
export class MessagingError extends Error {
  code: ErrorCode;
  details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'MessagingError';
    this.code = code;
    this.details = details;
  }

  /**
   * Convert error to a plain object suitable for serialization
   */
  toObject() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }

  /**
   * Create a MessagingError from an unknown error
   */
  static from(error: unknown): MessagingError {
    if (error instanceof MessagingError) {
      return error;
    }

    if (error instanceof Error) {
      return new MessagingError(ErrorCode.UNKNOWN, error.message, {
        originalError: error.name,
        stack: error.stack,
      });
    }

    return new MessagingError(ErrorCode.UNKNOWN, String(error), { originalError: error });
  }
}

/**
 * Timeout error class
 */
export class TimeoutError extends MessagingError {
  constructor(message = 'Operation timed out', details?: unknown) {
    super(ErrorCode.TIMEOUT, message, details);
    this.name = 'TimeoutError';
  }
}

/**
 * Connection error class
 */
export class ConnectionError extends MessagingError {
  constructor(message = 'Connection error', details?: unknown) {
    super(ErrorCode.CONNECTION_ERROR, message, details);
    this.name = 'ConnectionError';
  }
}

/**
 * Handler not found error class
 */
export class HandlerNotFoundError extends MessagingError {
  constructor(action: string, details?: unknown) {
    super(ErrorCode.HANDLER_NOT_FOUND, `No handler found for action: ${action}`, details);
    this.name = 'HandlerNotFoundError';
  }
}

/**
 * Permission denied error class
 */
export class PermissionDeniedError extends MessagingError {
  constructor(permission: string, details?: unknown) {
    super(ErrorCode.PERMISSION_DENIED, `Permission denied: ${permission}`, details);
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Tab not found error class
 */
export class TabNotFoundError extends MessagingError {
  constructor(tabId: number, details?: unknown) {
    super(ErrorCode.TAB_NOT_FOUND, `Tab not found: ${tabId}`, details);
    this.name = 'TabNotFoundError';
  }
}

/**
 * Invalid data error class
 */
export class InvalidDataError extends MessagingError {
  constructor(message = 'Invalid data', details?: unknown) {
    super(ErrorCode.INVALID_DATA, message, details);
    this.name = 'InvalidDataError';
  }
}

/**
 * Authentication required error class
 */
export class AuthRequiredError extends MessagingError {
  constructor(message = 'Authentication required', details?: unknown) {
    super(ErrorCode.AUTH_REQUIRED, message, details);
    this.name = 'AuthRequiredError';
  }
}

/**
 * Helper function to determine if an object is a MessagingError
 */
export function isMessagingError(obj: unknown): obj is MessagingError {
  return obj instanceof MessagingError;
}

/**
 * Helper function to determine if an error is a specific error type
 */
export function isErrorOfType(error: unknown, code: ErrorCode): boolean {
  return isMessagingError(error) && error.code === code;
}
