import { Alert, Platform } from 'react-native';

/**
 * Centralized User Feedback System
 * Provides consistent success/error messaging across the app
 */

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

export interface FeedbackOptions {
  title?: string;
  message: string;
  type?: FeedbackType;
  duration?: number;
  onDismiss?: () => void;
  actions?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

/**
 * Show a success message to the user
 */
export const showSuccess = (message: string, title: string = 'Success'): void => {
  Alert.alert(
    `✅ ${title}`,
    message,
    [{ text: 'OK', style: 'default' }],
    { cancelable: true }
  );
};

/**
 * Show an error message to the user with helpful instructions
 */
export const showError = (
  message: string,
  title: string = 'Error',
  instructions?: string
): void => {
  const fullMessage = instructions
    ? `${message}\n\n${instructions}`
    : message;

  Alert.alert(
    `❌ ${title}`,
    fullMessage,
    [{ text: 'OK', style: 'default' }],
    { cancelable: true }
  );
};

/**
 * Show a warning message to the user
 */
export const showWarning = (message: string, title: string = 'Warning'): void => {
  Alert.alert(
    `⚠️ ${title}`,
    message,
    [{ text: 'OK', style: 'default' }],
    { cancelable: true }
  );
};

/**
 * Show an info message to the user
 */
export const showInfo = (message: string, title: string = 'Info'): void => {
  Alert.alert(
    `ℹ️ ${title}`,
    message,
    [{ text: 'OK', style: 'default' }],
    { cancelable: true }
  );
};

/**
 * Show a confirmation dialog before a destructive action
 */
export const showConfirmation = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  title: string = 'Confirm Action'
): void => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
};

/**
 * Show a custom feedback message with custom actions
 */
export const showCustomFeedback = (options: FeedbackOptions): void => {
  const { title, message, type = 'info', actions } = options;

  const icon = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }[type];

  const displayTitle = title ? `${icon} ${title}` : icon;

  const alertActions = actions || [{ text: 'OK', style: 'default' as const }];

  Alert.alert(
    displayTitle,
    message,
    alertActions,
    { cancelable: true, onDismiss: options.onDismiss }
  );
};

/**
 * Handle service errors consistently
 * Converts technical errors into user-friendly messages
 */
export const handleServiceError = (
  error: any,
  operation: string,
  entityName: string = 'data'
): void => {
  console.error(`Error during ${operation}:`, error);

  let userMessage = `Failed to ${operation} ${entityName}.`;
  let instructions = 'Please try again.';

  // Common error patterns
  if (error?.message) {
    const errorMsg = error.message.toLowerCase();

    if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
      userMessage = 'Network connection error.';
      instructions = 'Please check your internet connection and try again.';
    } else if (errorMsg.includes('permission') || errorMsg.includes('unauthorized')) {
      userMessage = 'Permission denied.';
      instructions = 'You may need to sign in again to perform this action.';
    } else if (errorMsg.includes('not found') || errorMsg.includes('404')) {
      userMessage = `${entityName} not found.`;
      instructions = 'The item you\'re looking for may have been deleted.';
    } else if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
      userMessage = `This ${entityName} already exists.`;
      instructions = 'Please use a different name or check your existing items.';
    } else if (errorMsg.includes('timeout')) {
      userMessage = 'Request timed out.';
      instructions = 'The server is taking too long to respond. Please try again.';
    }
  }

  showError(userMessage, `${operation} Failed`, instructions);
};

/**
 * Success messages for common operations
 */
export const OperationSuccess = {
  created: (entityName: string) => showSuccess(`${entityName} created successfully!`),
  updated: (entityName: string) => showSuccess(`${entityName} updated successfully!`),
  deleted: (entityName: string) => showSuccess(`${entityName} deleted successfully!`),
  saved: (entityName: string) => showSuccess(`${entityName} saved successfully!`),
  completed: (entityName: string) => showSuccess(`${entityName} completed!`, 'Well done!'),
  synced: () => showSuccess('Data synced successfully!', 'Sync Complete'),

  // Specific operations
  habitCompleted: () => showSuccess('Great job! Keep up the good work!', 'Habit Completed'),
  habitCreated: () => showSuccess('Your new habit has been created!', 'Habit Added'),
  experimentStarted: () => showSuccess('Your experiment has started! Track it daily for best results.', 'Experiment Started'),
  journalSaved: () => showSuccess('Your journal entry has been saved.', 'Entry Saved'),
  sleepLogged: () => showSuccess('Sleep data recorded successfully!', 'Sleep Logged'),
  profileUpdated: () => showSuccess('Your profile has been updated.', 'Profile Saved'),
};

/**
 * Error messages for common operations
 */
export const OperationError = {
  create: (entityName: string, error: any) => handleServiceError(error, 'create', entityName),
  update: (entityName: string, error: any) => handleServiceError(error, 'update', entityName),
  delete: (entityName: string, error: any) => handleServiceError(error, 'delete', entityName),
  save: (entityName: string, error: any) => handleServiceError(error, 'save', entityName),
  load: (entityName: string, error: any) => handleServiceError(error, 'load', entityName),
  sync: (error: any) => handleServiceError(error, 'sync', 'data'),
};

/**
 * Validation error messages
 */
export const ValidationError = {
  required: (fieldName: string) => showError(`${fieldName} is required.`, 'Validation Error', 'Please fill in all required fields.'),
  invalid: (fieldName: string) => showError(`${fieldName} is invalid.`, 'Validation Error', 'Please check your input and try again.'),
  tooShort: (fieldName: string, minLength: number) => showError(`${fieldName} is too short.`, 'Validation Error', `Please enter at least ${minLength} characters.`),
  tooLong: (fieldName: string, maxLength: number) => showError(`${fieldName} is too long.`, 'Validation Error', `Please enter no more than ${maxLength} characters.`),
  invalidEmail: () => showError('Email address is invalid.', 'Validation Error', 'Please enter a valid email address.'),
  invalidPassword: () => showError('Password is too weak.', 'Validation Error', 'Password must be at least 6 characters long.'),
};

/**
 * Wraps an async operation with consistent error handling
 * Usage: await withFeedback(asyncOperation(), 'save', 'habit')
 */
export const withFeedback = async <T>(
  operation: Promise<T>,
  operationType: 'create' | 'update' | 'delete' | 'save' | 'load',
  entityName: string,
  showSuccessMessage: boolean = true,
  successMessage?: string
): Promise<{ success: boolean; data?: T }> => {
  try {
    const result = await operation;

    if (showSuccessMessage) {
      if (successMessage) {
        showSuccess(successMessage);
      } else {
        switch (operationType) {
          case 'create':
            OperationSuccess.created(entityName);
            break;
          case 'update':
            OperationSuccess.updated(entityName);
            break;
          case 'delete':
            OperationSuccess.deleted(entityName);
            break;
          case 'save':
            OperationSuccess.saved(entityName);
            break;
          default:
            showSuccess(`Operation completed successfully!`);
        }
      }
    }

    return { success: true, data: result };
  } catch (error) {
    OperationError[operationType](entityName, error);
    return { success: false };
  }
};

/**
 * Show loading feedback during async operations
 * Returns a function to dismiss the loading state
 */
export const showLoading = (message: string = 'Loading...'): (() => void) => {
  // In a future enhancement, this could show a loading toast/modal
  // For now, we'll just log it
  if (__DEV__) {
    console.log(`Loading: ${message}`);
  }

  return () => {
    if (__DEV__) {
      console.log(`Finished: ${message}`);
    }
  };
};
