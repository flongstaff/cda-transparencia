// Debug script to help identify any runtime issues
console.log('🔍 Transparency Portal Debug Script Loaded');

// Check if React is loaded
if (typeof React !== 'undefined') {
  console.log('✅ React is loaded');
} else {
  console.error('❌ React is not loaded');
}

// Check if ReactDOM is loaded
if (typeof ReactDOM !== 'undefined') {
  console.log('✅ ReactDOM is loaded');
} else {
  console.error('❌ ReactDOM is not loaded');
}

// Check if the root element exists
const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('✅ Root element found');
} else {
  console.error('❌ Root element not found');
}

// Check page content
setTimeout(() => {
  const content = document.body.innerText;
  if (content.length > 100) {
    console.log('✅ Page has content');
  } else {
    console.warn('⚠️ Page may be empty');
  }
  
  // Log debugging info
  console.log('📄 Page title:', document.title);
  console.log('📍 Location:', window.location.href);
  console.log('⚛️ React version:', React?.version);
}, 1000);

// Global error handler
window.addEventListener('error', (event) => {
  console.error('🚨 Global error caught:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
});