// Debug script to help identify any runtime issues
console.log('🔍 Transparency Portal Debug Script Loaded');

// Check if the root element exists
const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('✅ Root element found');
} else {
  console.error('❌ Root element not found');
}

// Check page content after a short delay
setTimeout(() => {
  const content = document.body.innerText;
  if (content.length > 100) {
    console.log('✅ Page has content');
  } else {
    console.warn('⚠️ Page may be empty');
  }
  
  // Log basic debugging info
  console.log('📄 Page title:', document.title);
  console.log('📍 Location:', window.location.href);

}, 1000);