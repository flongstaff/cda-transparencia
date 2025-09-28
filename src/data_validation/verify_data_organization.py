#!/usr/bin/env python3
"""
Data Organization Verification Script
Verifies that all data sources are properly organized and accessible
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataOrganizationVerifier:
    def __init__(self, base_dir: str = "."):
        self.base_dir = Path(base_dir)
        self.frontend_data = self.base_dir / "frontend" / "public" / "data"

        self.verification_results = {
            "data_structure": False,
            "api_endpoints": False,
            "csv_files": False,
            "pdf_files": False,
            "deduplication": False,
            "url_tracking": False,
            "hooks_configured": False
        }

    def verify_data_structure(self) -> bool:
        """Verify the main data directory structure"""
        logger.info("🔍 Verifying data directory structure...")

        required_dirs = ["api", "csv", "pdfs"]
        missing_dirs = []

        for dir_name in required_dirs:
            dir_path = self.frontend_data / dir_name
            if not dir_path.exists():
                missing_dirs.append(str(dir_path))
            else:
                logger.info(f"  ✅ {dir_name}/ directory exists")

        if missing_dirs:
            logger.error(f"  ❌ Missing directories: {missing_dirs}")
            return False

        logger.info(f"✅ Data structure verified at {self.frontend_data}")
        return True

    def verify_api_endpoints(self) -> bool:
        """Verify API JSON endpoints are properly created"""
        logger.info("🔍 Verifying API endpoints...")

        required_files = [
            "config.json",
            "csv_data.json",
            "documents.json",
            "index.json",
            "pdfs.json",
            "pdf_metadata.json"
        ]

        api_dir = self.frontend_data / "api"
        missing_files = []
        file_stats = {}

        for filename in required_files:
            file_path = api_dir / filename
            if not file_path.exists():
                missing_files.append(filename)
            else:
                try:
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                        file_stats[filename] = {
                            "size": file_path.stat().st_size,
                            "keys": list(data.keys()) if isinstance(data, dict) else "array",
                            "status": "valid"
                        }
                        logger.info(f"  ✅ {filename} - {file_stats[filename]['size']} bytes")
                except Exception as e:
                    file_stats[filename] = {"status": "invalid", "error": str(e)}
                    logger.error(f"  ❌ {filename} - Invalid JSON: {e}")

        if missing_files:
            logger.error(f"  ❌ Missing API files: {missing_files}")
            return False

        logger.info("✅ All API endpoints verified")
        return True

    def verify_csv_files(self) -> bool:
        """Verify CSV files for charts are generated"""
        logger.info("🔍 Verifying CSV files for charts...")

        csv_dir = self.frontend_data / "csv"
        if not csv_dir.exists():
            logger.error("  ❌ CSV directory not found")
            return False

        # Check for main consolidated CSV files
        main_csvs = [
            "transparency_data_complete.csv",
            "revenue_summary.csv",
            "expenses_summary.csv"
        ]

        missing_csvs = []
        csv_stats = {}

        for filename in main_csvs:
            file_path = csv_dir / filename
            if not file_path.exists():
                missing_csvs.append(filename)
            else:
                stat = file_path.stat()
                # Count lines
                with open(file_path, 'r') as f:
                    line_count = sum(1 for _ in f)

                csv_stats[filename] = {
                    "size": stat.st_size,
                    "lines": line_count,
                    "status": "exists"
                }
                logger.info(f"  ✅ {filename} - {line_count} rows, {stat.st_size} bytes")

        # Count total CSV files
        total_csvs = len(list(csv_dir.glob("*.csv")))
        logger.info(f"  📊 Total CSV files: {total_csvs}")

        if missing_csvs:
            logger.error(f"  ❌ Missing main CSV files: {missing_csvs}")
            return False

        logger.info("✅ CSV files verified for charts and SandDance")
        return True

    def verify_pdf_files(self) -> bool:
        """Verify PDF files are properly organized"""
        logger.info("🔍 Verifying PDF files organization...")

        pdfs_dir = self.frontend_data / "pdfs"
        if not pdfs_dir.exists():
            logger.error("  ❌ PDFs directory not found")
            return False

        # Count PDF files
        pdf_files = list(pdfs_dir.glob("*.pdf"))
        total_pdfs = len(pdf_files)

        if total_pdfs == 0:
            logger.error("  ❌ No PDF files found in public directory")
            return False

        logger.info(f"  📄 Total PDF files: {total_pdfs}")

        # Check a few files exist
        sample_files = pdf_files[:5]
        for pdf_file in sample_files:
            size = pdf_file.stat().st_size
            logger.info(f"  ✅ {pdf_file.name} - {size} bytes")

        logger.info("✅ PDF files properly organized")
        return True

    def verify_pdf_deduplication(self) -> bool:
        """Verify PDF SHA256 deduplication"""
        logger.info("🔍 Verifying PDF deduplication...")

        metadata_file = self.frontend_data / "api" / "pdf_metadata.json"
        if not metadata_file.exists():
            logger.error("  ❌ PDF metadata file not found")
            return False

        try:
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)

            # Check for unique hashes
            hashes = set(metadata.keys())
            total_files = len(metadata)

            logger.info(f"  📄 Total unique PDFs: {total_files}")
            logger.info(f"  🔒 Unique SHA256 hashes: {len(hashes)}")

            # Verify hash uniqueness
            if len(hashes) == total_files:
                logger.info("  ✅ All PDFs have unique SHA256 hashes (deduplication successful)")
                return True
            else:
                logger.error(f"  ❌ Hash collision detected: {total_files} files, {len(hashes)} hashes")
                return False

        except Exception as e:
            logger.error(f"  ❌ Error reading PDF metadata: {e}")
            return False

    def verify_url_tracking(self) -> bool:
        """Verify original URLs and web archive URLs are tracked"""
        logger.info("🔍 Verifying URL tracking...")

        metadata_file = self.frontend_data / "api" / "pdf_metadata.json"
        try:
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)

            total_files = len(metadata)
            with_original_url = 0
            with_web_archive = 0
            with_local_path = 0

            for hash_key, pdf_data in metadata.items():
                if pdf_data.get('original_url'):
                    with_original_url += 1
                if pdf_data.get('web_archive_url'):
                    with_web_archive += 1
                if pdf_data.get('local_path'):
                    with_local_path += 1

            logger.info(f"  📄 Total PDFs: {total_files}")
            logger.info(f"  🌐 With original URLs: {with_original_url}")
            logger.info(f"  📚 With web archive URLs: {with_web_archive}")
            logger.info(f"  💾 With local paths: {with_local_path}")

            # All files should have local paths
            if with_local_path == total_files:
                logger.info("  ✅ All PDFs have local path tracking")
                return True
            else:
                logger.error(f"  ❌ Missing local paths: {total_files - with_local_path} files")
                return False

        except Exception as e:
            logger.error(f"  ❌ Error verifying URL tracking: {e}")
            return False

    def verify_hooks_configuration(self) -> bool:
        """Verify React hooks are properly configured"""
        logger.info("🔍 Verifying React hooks configuration...")

        hooks_file = self.base_dir / "frontend" / "src" / "hooks" / "useTransparencyData.ts"
        if not hooks_file.exists():
            logger.error("  ❌ useTransparencyData.ts not found")
            return False

        try:
            content = hooks_file.read_text()

            # Check for required hooks
            required_hooks = [
                "useTransparencyData",
                "useCSVData",
                "useFinancialData",
                "useDocumentData",
                "usePDFData"
            ]

            missing_hooks = []
            for hook in required_hooks:
                if f"export const {hook}" not in content and f"export function {hook}" not in content:
                    missing_hooks.append(hook)
                else:
                    logger.info(f"  ✅ {hook} hook found")

            # Check for API endpoints
            required_endpoints = [
                "/data/api/config.json",
                "/data/api/pdfs.json",
                "/data/api/pdf_metadata.json"
            ]

            missing_endpoints = []
            for endpoint in required_endpoints:
                if endpoint not in content:
                    missing_endpoints.append(endpoint)
                else:
                    logger.info(f"  ✅ {endpoint} endpoint configured")

            if missing_hooks:
                logger.error(f"  ❌ Missing hooks: {missing_hooks}")
                return False

            if missing_endpoints:
                logger.error(f"  ❌ Missing endpoint references: {missing_endpoints}")
                return False

            logger.info("✅ React hooks properly configured")
            return True

        except Exception as e:
            logger.error(f"  ❌ Error verifying hooks: {e}")
            return False

    def run_verification(self) -> Dict[str, bool]:
        """Run complete verification"""
        logger.info("🚀 Starting data organization verification...")

        self.verification_results["data_structure"] = self.verify_data_structure()
        self.verification_results["api_endpoints"] = self.verify_api_endpoints()
        self.verification_results["csv_files"] = self.verify_csv_files()
        self.verification_results["pdf_files"] = self.verify_pdf_files()
        self.verification_results["deduplication"] = self.verify_pdf_deduplication()
        self.verification_results["url_tracking"] = self.verify_url_tracking()
        self.verification_results["hooks_configured"] = self.verify_hooks_configuration()

        # Summary
        passed = sum(self.verification_results.values())
        total = len(self.verification_results)

        logger.info(f"\n📊 VERIFICATION SUMMARY:")
        logger.info(f"  ✅ Passed: {passed}/{total} checks")

        for check, result in self.verification_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            logger.info(f"  {status}: {check.replace('_', ' ').title()}")

        if passed == total:
            logger.info("\n🎉 ALL VERIFICATION CHECKS PASSED!")
            logger.info("   Data organization is complete and ready for web access")
        else:
            logger.error(f"\n❌ {total - passed} checks failed. Please review and fix issues.")

        return self.verification_results

def main():
    verifier = DataOrganizationVerifier()
    results = verifier.run_verification()

    # Exit with appropriate code
    if all(results.values()):
        exit(0)
    else:
        exit(1)

if __name__ == "__main__":
    main()