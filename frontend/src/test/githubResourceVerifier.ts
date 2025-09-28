/**
 * GitHub Resource Verification Utility
 * Utility to verify that our implementation works with real GitHub resources
 */

import { unifiedResourceService } from '../services/UnifiedResourceService';
import { DocumentMetadata, SupportedFileType } from '../types/documents';

// Test configuration
const TEST_RESOURCES = [
  {
    path: 'data/organized_documents/json/budget_data.json',
    type: 'json' as SupportedFileType,
    description: 'Datos presupuestarios'
  },
  {
    path: 'data/organized_documents/md/README.md',
    type: 'md' as SupportedFileType,
    description: 'Documento README'
  },
  {
    path: 'data/organized_documents/pdf/presupuesto-2024.pdf',
    type: 'pdf' as SupportedFileType,
    description: 'Presupuesto anual'
  },
  {
    path: 'data/organized_documents/images/logo-municipal.png',
    type: 'png' as SupportedFileType,
    description: 'Logo municipal'
  },
  {
    path: 'data/organized_documents/archives/documents.zip',
    type: 'zip' as SupportedFileType,
    description: 'Archivos comprimidos'
  }
];

export class GitHubResourceVerifier {
  private results: { path: string; status: 'success' | 'error'; message: string }[] = [];

  async verifyAllResources(): Promise<void> {
    console.log('🔍 Starting GitHub resource verification...\\n');
    
    for (const resource of TEST_RESOURCES) {
      await this.verifyResource(resource.path, resource.type, resource.description);
    }
    
    this.printResults();
  }

  private async verifyResource(
    path: string, 
    type: SupportedFileType, 
    description: string
  ): Promise<void> {
    try {
      console.log(`🧪 Testing ${description} (${type}): ${path}`);
      
      // Test fetching document metadata
      const metadata = await unifiedResourceService.fetchDocumentMetadata(path);
      if (!metadata) {
        throw new Error('No metadata found');
      }
      
      // Test fetching content based on type
      switch (type) {
        case 'json': {
          const jsonData = await unifiedResourceService.fetchJSON(path);
          if (!jsonData) {
            throw new Error('Empty JSON data');
          }
          break;
        }
          
        case 'md':
        case 'txt':
        case 'csv': {
          const textData = await unifiedResourceService.fetchText(path);
          if (!textData) {
            throw new Error('Empty text data');
          }
          break;
        }
          
        case 'pdf':
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
        case 'zip':
        case 'rar':
        case '7z':
        case 'doc':
        case 'docx':
        case 'xls':
        case 'xlsx':
        case 'ppt':
        case 'pptx': {
          // For binary files, just verify we can fetch them
          const response = await fetch(metadata.url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          break;
        }
          
        default:
          throw new Error(`Unsupported file type: ${type}`);
      }
      
      // Record success
      this.results.push({
        path,
        status: 'success',
        message: 'Resource verified successfully'
      });
      
      console.log(`✅ Success: ${description}\\n`);
      
    } catch (error) {
      // Record error
      this.results.push({
        path,
        status: 'error',
        message: (error as Error).message
      });
      
      console.log(`❌ Error verifying ${description}: ${(error as Error).message}\\n`);
    }
  }

  private printResults(): void {
    const successes = this.results.filter(r => r.status === 'success').length;
    const errors = this.results.filter(r => r.status === 'error').length;
    
    console.log('📊 GitHub Resource Verification Results:');
    console.log('=====================================');
    console.log(`✅ Successful: ${successes}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📋 Total: ${this.results.length}`);
    
    if (errors > 0) {
      console.log('\\n💥 Errors found:');
      this.results
        .filter(r => r.status === 'error')
        .forEach(result => {
          console.log(`   ❌ ${result.path}: ${result.message}`);
        });
    }
    
    if (successes > 0) {
      console.log('\\n🎉 Successful verifications:');
      this.results
        .filter(r => r.status === 'success')
        .forEach(result => {
          console.log(`   ✅ ${result.path}`);
        });
    }
    
    console.log('\\n🏁 Resource verification completed!');
  }
}

// Export singleton instance
export const githubResourceVerifier = new GitHubResourceVerifier();

// Run verification if called directly
if (typeof window !== 'undefined' && window.location.pathname === '/test/resources') {
  githubResourceVerifier.verifyAllResources().catch(console.error);
}

export default githubResourceVerifier;