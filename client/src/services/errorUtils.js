
export const getFriendlyErrorMessage = (error) => {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  // Handle axios errors
  if (error.isAxiosError) {
    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (error.code === 'ERR_CANCELED') {
      return 'Request was canceled.';
    }

    const status = error.response?.status;
    if (status === 400) {
      // Check if response has message
      const serverMessage = error.response?.data?.message;
      if (serverMessage) {
        return serverMessage;
      }
      return 'Invalid request. Please check your input and try again.';
    }
    if (status === 401) {
      return 'You are not authorized. Please sign in again.';
    }
    if (status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (status === 404) {
      return 'The requested resource was not found.';
    }
    if (status === 408) {
      return 'Request timed out. Please try again.';
    }
    if (status >= 500) {
      return 'Server error. Please try again later.';
    }
  }

  // Handle general errors
  if (error.message) {
    const msg = error.message.toLowerCase();
    if (msg.includes('network error')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (msg.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
  }

  return 'Something went wrong. Please try again.';
};

export const createFriendlyError = (error) => {
  const friendlyMessage = getFriendlyErrorMessage(error);
  const friendlyError = new Error(friendlyMessage);
  friendlyError.originalError = error;
  return friendlyError;
};
