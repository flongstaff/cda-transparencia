// Simple error logging utility
export const logError = (component: string, error: Error | unknown, context?: Record<string, unknown>) => {
  console.group(`❌ ERROR in ${component}`);
  console.error('Error details:', error);
  if (context) {
    console.log('Context:', context);
  }
  console.groupEnd();
};

export const logSuccess = (component: string, message: string, data?: Record<string, unknown>) => {
  console.group(`✅ SUCCESS in ${component}`);
  console.log(message);
  if (data) {
    console.log('Data:', data);
  }
  console.groupEnd();
};

export const logWarning = (component: string, message: string, details?: Record<string, unknown>) => {
  console.group(`⚠️ WARNING in ${component}`);
  console.warn(message);
  if (details) {
    console.log('Details:', details);
  }
  console.groupEnd();
};