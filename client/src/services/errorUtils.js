import i18n from '../../i18n/index.js';

const t = (key, fallback) => {
  const result = i18n.t(key, { ns: 'errors' });
  return result !== key ? result : fallback;
};

export const getFriendlyErrorMessage = (error) => {
  if (!error) {
    return t('SERVER_ERROR', 'Something went wrong. Please try again.');
  }

  // Handle axios errors
  if (error.isAxiosError) {
    if (error.code === 'ERR_NETWORK') {
      return t('NETWORK_CONNECTION_ERROR', 'Network error. Please check your internet connection and try again.');
    }
    if (error.code === 'ERR_CANCELED') {
      return 'Request was canceled.';
    }

    // Prefer server-provided error code for i18n
    const serverCode = error.response?.data?.code;
    if (serverCode) {
      const translated = t(serverCode, null);
      if (translated) return translated;
    }

    const serverMessage = error.response?.data?.message;
    if (serverMessage) return serverMessage;

    const status = error.response?.status;
    if (status === 400) return t('VALIDATION_REQUIRED', 'Invalid request. Please check your input and try again.');
    if (status === 401) return t('AUTH_UNAUTHORIZED', 'You are not authorized. Please sign in again.');
    if (status === 403) return t('AUTH_UNAUTHORIZED', 'You do not have permission to perform this action.');
    if (status === 404) return t('SECURITY_NO_RESULTS', 'The requested resource was not found.');
    if (status === 408) return t('SERVER_TIMEOUT', 'Request timed out. Please try again.');
    if (status >= 500) return t('SERVER_ERROR', 'Server error. Please try again later.');
  }

  // Handle general errors
  if (error.message) {
    const msg = error.message.toLowerCase();
    if (msg.includes('network error')) return t('NETWORK_CONNECTION_ERROR', 'Network error. Please check your internet connection and try again.');
    if (msg.includes('timeout')) return t('SERVER_TIMEOUT', 'Request timed out. Please try again.');
  }

  return t('SERVER_ERROR', 'Something went wrong. Please try again.');
};

export const createFriendlyError = (error) => {
  const friendlyMessage = getFriendlyErrorMessage(error);
  const friendlyError = new Error(friendlyMessage);
  friendlyError.originalError = error;
  return friendlyError;
};
