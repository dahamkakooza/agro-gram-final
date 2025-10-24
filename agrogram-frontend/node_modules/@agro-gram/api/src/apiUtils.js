export const isValidationError = (result) => result && result.errors;
export const getFieldErrors = (result) => result.errors || {};
export const formatErrorForDisplay = (result) => result.message || 'An error occurred';