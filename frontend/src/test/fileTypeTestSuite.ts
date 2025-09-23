/**
 * Comprehensive File Type Test Suite
 * Test suite to verify all file type handling with real GitHub resources
 */

import { unifiedResourceService } from '../services/UnifiedResourceService';
import { DocumentMetadata, SupportedFileType } from '../types/documents';

// Test configuration
const TEST_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRIES: 3,
  CONCURRENT_TESTS: 5
};

// Test results interface
interface TestResult {
  fileType: SupportedFileType;
  fileName: string;
  status: 'passed' | 'failed' | 'skipped';
  message?: string;
  duration: number;
}

// File type test cases
const FILE_TYPE_TEST_CASES: { fileType: SupportedFileType; fileName: string; }[] = [
  { fileType: 'pdf', fileName: 'presupuesto-2024.pdf' },
  { fileType: 'md', fileName: 'informe-ejecucion.md' },
  { fileType: 'jpg', fileName: 'grafico-ingresos.jpg' },
  { fileType: 'json', fileName: 'sueldos-2024.json' },
  { fileType: 'zip', fileName: 'contratos-2024.zip' },
  { fileType: 'docx', fileName: 'informe-anual.docx' },
  { fileType: 'xlsx', fileName: 'presupuesto-detallado.xlsx' },
  { fileType: 'txt', fileName: 'asistencia.txt' },
  { fileType: 'csv', fileName: 'gastos-2024.csv' },
  { fileType: 'png', fileName: 'logo-municipal.png' }
];

class FileTypeTestSuite {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<void> {
    this.startTime = Date.now();
    console.log('🚀 Starting comprehensive file type tests...\\n');
    
    // Run tests concurrently with limited concurrency
    const chunks = this.chunkArray(FILE_TYPE_TEST_CASES, TEST_CONFIG.CONCURRENT_TESTS);
    
    for (const chunk of chunks) {
      await Promise.all(chunk.map(testCase => this.runSingleTest(testCase)));
    }
    
    this.printResults();
  }

  private async runSingleTest(testCase: { fileType: SupportedFileType; fileName: string; }): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Testing ${testCase.fileType}: ${testCase.fileName}`);
      
      // Test 1: Fetch document metadata
      const metadata = await this.testDocumentMetadata(testCase.fileName);
      
      // Test 2: Fetch document content based on file type
      await this.testDocumentContent(testCase.fileType, testCase.fileName, metadata);
      
      // Test 3: Verify document properties
      this.testDocumentProperties(metadata, testCase.fileType);
      
      // Record success
      this.results.push({
        fileType: testCase.fileType,
        fileName: testCase.fileName,
        status: 'passed',
        duration: Date.now() - startTime
      });
      
      console.log(`✅ ${testCase.fileType}: ${testCase.fileName} - PASSED\\n`);
      
    } catch (error) {
      // Record failure
      this.results.push({
        fileType: testCase.fileType,
        fileName: testCase.fileName,
        status: 'failed',
        message: (error as Error).message,
        duration: Date.now() - startTime
      });
      
      console.log(`❌ ${testCase.fileType}: ${testCase.fileName} - FAILED: ${(error as Error).message}\\n`);
    }
  }

  private async testDocumentMetadata(fileName: string): Promise<DocumentMetadata | null> {
    try {
      // Try to find document by filename
      const searchResults = await unifiedResourceService.searchResources(fileName);
      
      if (searchResults.length === 0) {
        throw new Error(`Document not found: ${fileName}`);
      }
      
      const document = searchResults[0];
      console.log(`   📄 Found document: ${document.title}`);
      
      return document;
    } catch (error) {
      throw new Error(`Metadata fetch failed: ${(error as Error).message}`);
    }
  }

  private async testDocumentContent(
    fileType: SupportedFileType, 
    fileName: string, 
    metadata: DocumentMetadata | null
  ): Promise<void> {
    if (!metadata || !metadata.url) {
      throw new Error('No document URL available');
    }
    
    try {
      switch (fileType) {
        case 'pdf':
          // For PDF, we just verify we can fetch it
          await this.fetchBinaryContent(metadata.url);
          break;
          
        case 'md':
        case 'txt':
        case 'csv':
          // For text-based files, fetch and verify content
          const textContent = await unifiedResourceService.fetchText(metadata.relative_path);
          if (!textContent || textContent.length === 0) {
            throw new Error('Empty text content');
          }
          break;
          
        case 'json':
          // For JSON files, fetch and parse
          const jsonData = await unifiedResourceService.fetchJSON(metadata.relative_path);
          if (!jsonData) {
            throw new Error('Empty JSON data');
          }
          break;
          
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
          // For images, verify we can fetch them
          await this.fetchBinaryContent(metadata.url);
          break;
          
        case 'zip':
        case 'rar':
        case '7z':
          // For archives, verify we can fetch them
          await this.fetchBinaryContent(metadata.url);
          break;
          
        case 'doc':
        case 'docx':
        case 'xls':
        case 'xlsx':
        case 'ppt':
        case 'pptx':
          // For office files, verify we can fetch them
          await this.fetchBinaryContent(metadata.url);
          break;
          
        default:
          // For other file types, verify we can fetch them
          await this.fetchBinaryContent(metadata.url);
      }
      
      console.log(`   📥 Content fetch successful`);
    } catch (error) {
      throw new Error(`Content fetch failed: ${(error as Error).message}`);
    }
  }

  private async fetchBinaryContent(url: string): Promise<Blob> {
    const response = await fetch(url, { 
      method: 'GET',
      headers: {
        'Accept': '*/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.blob();
  }

  private testDocumentProperties(metadata: DocumentMetadata | null, expectedType: SupportedFileType): void {
    if (!metadata) {
      throw new Error('No metadata to validate');
    }
    
    // Validate required properties
    if (!metadata.id) {
      throw new Error('Missing document ID');
    }
    
    if (!metadata.title) {
      throw new Error('Missing document title');
    }
    
    if (!metadata.filename) {
      throw new Error('Missing document filename');
    }
    
    if (!metadata.url) {
      throw new Error('Missing document URL');
    }
    
    if (!metadata.year || metadata.year < 2000 || metadata.year > new Date().getFullYear()) {
      throw new Error('Invalid document year');
    }
    
    if (!metadata.category) {
      throw new Error('Missing document category');
    }
    
    if (!metadata.size_mb) {
      throw new Error('Missing document size');
    }
    
    if (!metadata.processing_date) {
      throw new Error('Missing processing date');
    }
    
    if (metadata.file_type !== expectedType) {
      throw new Error(`File type mismatch: expected ${expectedType}, got ${metadata.file_type}`);
    }
    
    console.log(`   ✅ Properties validation successful`);
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private printResults(): void {
    const totalTime = Date.now() - this.startTime;
    const passedTests = this.results.filter(r => r.status === 'passed').length;
    const failedTests = this.results.filter(r => r.status === 'failed').length;
    const skippedTests = this.results.filter(r => r.status === 'skipped').length;
    
    console.log('\\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`⏱️  Total time: ${totalTime}ms`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⏭️  Skipped: ${skippedTests}`);
    console.log(`📋 Total: ${this.results.length}`);
    
    if (failedTests > 0) {
      console.log('\\n💥 Failed Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`   ❌ ${result.fileType}: ${result.fileName} - ${result.message}`);
        });
    }
    
    if (passedTests > 0) {
      console.log('\\n🎉 Passed Tests:');
      this.results
        .filter(r => r.status === 'passed')
        .forEach(result => {
          console.log(`   ✅ ${result.fileType}: ${result.fileName} (${result.duration}ms)`);
        });
    }
    
    console.log('\\n🏁 Test suite completed!');
    
    // Overall result
    if (failedTests === 0) {
      console.log('🏆 All tests passed! File type handling is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please check the implementation.');
    }
  }
}

// Export test suite
export const fileTypeTestSuite = new FileTypeTestSuite();

// Run tests if called directly
if (import.meta.url === new URL('', import.meta.url).href) {
  fileTypeTestSuite.runAllTests().catch(console.error);
}

export default fileTypeTestSuite;