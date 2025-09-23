/**
 * Test script to verify file type handling
 * This script tests the unified resource service with real GitHub resources
 */

import { unifiedResourceService } from './services/UnifiedResourceService';
import { SupportedFileType } from './types/documents';

async function runFileTypeTests() {
  console.log('Starting file type tests...');
  
  // Test files - these should exist in your GitHub repository
  const testFiles = [
    { path: 'README.md', type: 'md', description: 'README file' },
    { path: 'package.json', type: 'json', description: 'Package JSON' },
    { path: 'LICENSE', type: 'txt', description: 'License file' }
  ];
  
  for (const file of testFiles) {
    try {
      console.log(`\nTesting ${file.description} (${file.path})...`);
      
      // Test fetching document metadata
      const metadata = await unifiedResourceService.fetchDocumentMetadata(file.path);
      if (metadata) {
        console.log(`✓ Successfully fetched metadata for ${file.path}`);
        console.log(`  Title: ${metadata.title}`);
        console.log(`  File type: ${metadata.file_type}`);
        console.log(`  Size: ${metadata.size_mb} MB`);
      } else {
        console.log(`⚠ No metadata found for ${file.path}`);
      }
      
      // Test fetching text content
      if (['md', 'txt', 'json', 'csv'].includes(file.type)) {
        const content = await unifiedResourceService.fetchText(file.path);
        console.log(`✓ Successfully fetched content for ${file.path}`);
        console.log(`  Content length: ${content.length} characters`);
      }
      
    } catch (error) {
      console.error(`✗ Error testing ${file.path}:`, error);
    }
  }
  
  console.log('\nFile type tests completed.');
}

// Run the tests
runFileTypeTests().catch(console.error);
