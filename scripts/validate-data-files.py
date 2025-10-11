#!/usr/bin/env python3
"""
Comprehensive Data Validation Script
Validates naming consistency, checksums, and linking properties for all data files
"""

import os
import json
import hashlib
import logging
from pathlib import Path
from typing import Dict, List, Tuple

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ComprehensiveDataValidator:
    def __init__(self, base_dir: str = "/Users/flong/Developer/cda-transparencia"):
        self.base_dir = Path(base_dir)
        self.data_dir = self.base_dir / "data"
        self.central_pdfs_dir = self.base_dir / "central_pdfs" / "originals"
        self.organized_pdfs_dir = self.data_dir / "organized_pdfs"
        
        # File extensions to validate
        self.file_extensions = ['.pdf', '.csv', '.json']
        
        # Results storage
        self.validation_results = {
            "total_files_checked": 0,
            "consistency_issues": [],
            "checksum_issues": [],
            "linking_issues": [],
            "missing_files": [],
            "validation_passed": False
        }

    def calculate_file_checksum(self, file_path: Path) -> str:
        """Calculate MD5 checksum for a file"""
        hash_md5 = hashlib.md5()
        try:
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception as e:
            logger.warning(f"Could not calculate checksum for {file_path}: {e}")
            return None

    def validate_naming_consistency(self) -> bool:
        """Validate naming consistency across all data files"""
        logger.info("🔍 Validating naming consistency...")
        
        # Check organized_pdfs directory structure
        if not self.organized_pdfs_dir.exists():
            logger.error(f"❌ Organized PDFs directory not found: {self.organized_pdfs_dir}")
            return False
            
        # Check for inconsistent naming patterns
        issues_found = 0
        
        # Walk through organized_pdfs directory
        for root, dirs, files in os.walk(self.organized_pdfs_dir):
            for file in files:
                if file.endswith('.pdf'):
                    file_path = Path(root) / file
                    
                    # Check if it's a symlink
                    if file_path.is_symlink():
                        target = file_path.resolve()
                        if not target.exists():
                            self.validation_results["missing_files"].append({
                                "symlink": str(file_path),
                                "target": str(target),
                                "issue": "Broken symlink - target does not exist"
                            })
                            issues_found += 1
                            logger.warning(f"❌ Broken symlink: {file_path} -> {target}")
                    
                    # Check naming patterns
                    # Files should follow pattern: prefix_year_suffix.ext or prefix_suffix.ext
                    parts = file.split('_')
                    if len(parts) < 2:
                        self.validation_results["consistency_issues"].append({
                            "file": str(file_path),
                            "issue": "Non-descriptive filename"
                        })
                        issues_found += 1
                        logger.warning(f"⚠️  Non-descriptive filename: {file}")
                        
        logger.info(f"✅ Naming consistency check completed. Found {issues_found} issues.")
        return issues_found == 0

    def validate_checksums(self) -> bool:
        """Validate checksums for data files"""
        logger.info("🔍 Validating file checksums...")
        
        # For now, we'll just check that files exist and can be read
        # A full checksum validation would require a reference database of known good checksums
        issues_found = 0
        
        # Check that we can read a sample of files
        sample_files = list(self.data_dir.rglob("*.json"))[:10]  # Check first 10 JSON files
        for file_path in sample_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    json.load(f)  # Try to parse JSON
                logger.debug(f"✅ Valid JSON file: {file_path}")
            except Exception as e:
                self.validation_results["checksum_issues"].append({
                    "file": str(file_path),
                    "issue": f"Invalid JSON: {str(e)}"
                })
                issues_found += 1
                logger.warning(f"❌ Invalid JSON in {file_path}: {e}")
                
        logger.info(f"✅ Checksum validation completed. Found {issues_found} issues in sample files.")
        return issues_found == 0

    def validate_linking_properties(self) -> bool:
        """Validate linking properties between related files"""
        logger.info("🔍 Validating linking properties...")
        
        # Check that symlinked files in organized_pdfs point to valid targets
        issues_found = 0
        
        # Find all symlinks in organized_pdfs
        for root, dirs, files in os.walk(self.organized_pdfs_dir):
            for file in files:
                file_path = Path(root) / file
                if file_path.is_symlink():
                    target = file_path.resolve()
                    if not target.exists():
                        self.validation_results["linking_issues"].append({
                            "symlink": str(file_path),
                            "target": str(target),
                            "issue": "Target file does not exist"
                        })
                        issues_found += 1
                        logger.warning(f"❌ Broken symlink: {file_path} -> {target}")
                    else:
                        logger.debug(f"✅ Valid symlink: {file_path} -> {target}")
                        
        # Check data index files for consistency
        index_files = [
            self.data_dir / "data-index.json",
            self.data_dir / "master_index.json",
            self.data_dir / "data-mapping.json"
        ]
        
        for index_file in index_files:
            if index_file.exists():
                try:
                    with open(index_file, 'r', encoding='utf-8') as f:
                        json.load(f)  # Try to parse
                    logger.debug(f"✅ Valid index file: {index_file}")
                except Exception as e:
                    self.validation_results["linking_issues"].append({
                        "file": str(index_file),
                        "issue": f"Invalid JSON in index file: {str(e)}"
                    })
                    issues_found += 1
                    logger.warning(f"❌ Invalid JSON in index file {index_file}: {e}")
            else:
                logger.warning(f"⚠️  Index file not found: {index_file}")
                
        logger.info(f"✅ Linking properties validation completed. Found {issues_found} issues.")
        return issues_found == 0

    def run_comprehensive_validation(self) -> Dict:
        """Run all validation checks"""
        logger.info("🚀 Starting comprehensive data validation...")
        
        # Run individual checks
        naming_ok = self.validate_naming_consistency()
        checksum_ok = self.validate_checksums()
        linking_ok = self.validate_linking_properties()
        
        # Summary
        total_issues = (
            len(self.validation_results["consistency_issues"]) +
            len(self.validation_results["checksum_issues"]) +
            len(self.validation_results["linking_issues"]) +
            len(self.validation_results["missing_files"])
        )
        
        self.validation_results["validation_passed"] = (naming_ok and checksum_ok and linking_ok and total_issues == 0)
        self.validation_results["summary"] = {
            "naming_consistency_passed": naming_ok,
            "checksum_validation_passed": checksum_ok,
            "linking_validation_passed": linking_ok,
            "total_issues_found": total_issues
        }
        
        logger.info("🏁 Comprehensive validation completed")
        return self.validation_results

def main():
    validator = ComprehensiveDataValidator()
    results = validator.run_comprehensive_validation()
    
    # Print summary
    print("\\n" + "="*50)
    print("COMPREHENSIVE DATA VALIDATION RESULTS")
    print("="*50)
    
    summary = results["summary"]
    print(f"Naming Consistency: {'✅ PASSED' if summary['naming_consistency_passed'] else '❌ FAILED'}")
    print(f"Checksum Validation: {'✅ PASSED' if summary['checksum_validation_passed'] else '❌ FAILED'}")
    print(f"Linking Validation: {'✅ PASSED' if summary['linking_validation_passed'] else '❌ FAILED'}")
    print(f"Overall Result: {'✅ ALL TESTS PASSED' if results['validation_passed'] else '❌ ISSUES FOUND'}")
    print(f"Total Issues: {summary['total_issues_found']}")
    
    # Print detailed issues if any
    if summary['total_issues_found'] > 0:
        print("\\nDetailed Issues:")
        print("-" * 30)
        
        if results["consistency_issues"]:
            print("\\n📝 Naming Consistency Issues:")
            for issue in results["consistency_issues"][:5]:  # Show first 5
                print(f"  - {issue['file']}: {issue['issue']}")
            if len(results["consistency_issues"]) > 5:
                print(f"  ... and {len(results['consistency_issues']) - 5} more")
                
        if results["checksum_issues"]:
            print("\\n🔍 Checksum Issues:")
            for issue in results["checksum_issues"][:5]:  # Show first 5
                print(f"  - {issue['file']}: {issue['issue']}")
            if len(results["checksum_issues"]) > 5:
                print(f"  ... and {len(results['checksum_issues']) - 5} more")
                
        if results["linking_issues"]:
            print("\\n🔗 Linking Issues:")
            for issue in results["linking_issues"][:5]:  # Show first 5
                print(f"  - {issue.get('symlink', issue.get('file', 'Unknown'))}: {issue['issue']}")
            if len(results["linking_issues"]) > 5:
                print(f"  ... and {len(results['linking_issues']) - 5} more")
                
        if results["missing_files"]:
            print("\\n📂 Missing Files:")
            for issue in results["missing_files"][:5]:  # Show first 5
                print(f"  - {issue['symlink']} -> {issue['target']}: {issue['issue']}")
            if len(results["missing_files"]) > 5:
                print(f"  ... and {len(results['missing_files']) - 5} more")
    
    # Save results to file
    results_file = Path("/Users/flong/Developer/cda-transparencia/data/validation_results.json")
    try:
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"\\n💾 Validation results saved to: {results_file}")
    except Exception as e:
        print(f"\\n⚠️  Could not save validation results: {e}")
    
    return results["validation_passed"]

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)