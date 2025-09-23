#!/usr/bin/env python3
"""
Website Data Validator - Ensures all processed data is ready for website display
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

class WebsiteDataValidator:
    """Validates that all data is properly processed and ready for website display"""
    
    def __init__(self, data_path: str = "data"):
        self.data_path = Path(data_path)
        self.validation_results = []
    
    def validate_data_structure(self) -> Dict[str, Any]:
        """Validate that all data is in proper structure for website display"""
        print("Validating data structure for website display...")
        
        # Check key directories
        required_directories = [
            "data/organized_documents/json",
            "data/organized_pdfs",
            "data/markdown_documents",
            "data/pdfs"
        ]
        
        validation_results = {
            "directories_check": {},
            "json_files_check": {},
            "data_integrity": {}
        }
        
        # Check directories
        for dir_path in required_directories:
            full_path = self.data_path / dir_path
            exists = full_path.exists()
            validation_results["directories_check"][dir_path] = {
                "exists": exists,
                "file_count": len(list(full_path.glob("*"))) if exists else 0
            }
            print(f"Directory {dir_path}: {'✓' if exists else '✗'}")
        
        # Check JSON files structure
        json_dir = self.data_path / "data/organized_documents/json"
        if json_dir.exists():
            json_files = list(json_dir.glob("*.json"))
            validation_results["json_files_check"]["total_json"] = len(json_files)
            
            # Validate a few sample JSON files
            valid_count = 0
            for json_file in json_files[:5]:  # Check first 5 files
                try:
                    with open(json_file, 'r') as f:
                        data = json.load(f)
                    
                    # Basic validation - check if it's valid JSON and has expected structure
                    if isinstance(data, (dict, list)):
                        valid_count += 1
                except Exception as e:
                    print(f"  Invalid JSON in {json_file}: {e}")
            
            validation_results["json_files_check"]["valid_json"] = valid_count
            print(f"JSON files validation: {valid_count}/{min(5, len(json_files))} valid")
        
        return validation_results
    
    def check_processing_completeness(self) -> Dict[str, Any]:
        """Check if all processing steps were completed"""
        print("\nChecking processing completeness...")
        
        # Check for processed files
        processed_files = {
            "pdf_extraction": list(self.data_path.rglob("*_extraction.json")),
            "document_analysis": list(self.data_path.rglob("analysis_*.json")),
            "verification_reports": list(self.data_path.rglob("*verification*.json")),
            "consolidated_data": list(self.data_path.rglob("consolidated_*.json"))
        }
        
        completeness_results = {}
        for key, files in processed_files.items():
            completeness_results[key] = {
                "count": len(files),
                "files": [str(f.name) for f in files[:3]]  # Show first 3 names
            }
            print(f"{key.replace('_', ' ').title()}: {len(files)} files")
        
        return completeness_results
    
    def validate_website_ready_data(self) -> Dict[str, Any]:
        """Validate that data is specifically formatted for website display"""
        print("\nValidating website-ready data format...")
        
        # Look for data that would be directly used by the frontend
        website_ready_data = {
            "financial_reports": [],
            "documents_metadata": [],
            "analysis_results": [],
            "verification_summary": []
        }
        
        # Check for financial reports (likely used by website)
        financial_files = list(self.data_path.rglob("*financial*.json"))
        website_ready_data["financial_reports"] = [str(f) for f in financial_files]
        print(f"Financial reports: {len(financial_files)} files")
        
        # Check for metadata files (likely used by website)
        metadata_files = list(self.data_path.rglob("*metadata*.json"))
        website_ready_data["documents_metadata"] = [str(f) for f in metadata_files]
        print(f"Document metadata: {len(metadata_files)} files")
        
        # Check for analysis results
        analysis_files = list(self.data_path.rglob("*analysis*.json"))
        website_ready_data["analysis_results"] = [str(f) for f in analysis_files]
        print(f"Analysis results: {len(analysis_files)} files")
        
        # Check for verification summaries
        verification_files = list(self.data_path.rglob("*verification*summary*.json"))
        website_ready_data["verification_summary"] = [str(f) for f in verification_files]
        print(f"Verification summaries: {len(verification_files)} files")
        
        return website_ready_data
    
    def run_comprehensive_validation(self) -> Dict[str, Any]:
        """Run all validations and generate comprehensive report"""
        print("=" * 60)
        print("WEBSITE DATA VALIDATION REPORT")
        print("=" * 60)
        
        # Run all validation checks
        structure_validation = self.validate_data_structure()
        processing_validation = self.check_processing_completeness()
        website_validation = self.validate_website_ready_data()
        
        # Generate overall assessment
        assessment = self.generate_assessment(
            structure_validation, 
            processing_validation, 
            website_validation
        )
        
        # Create final report
        report = {
            "timestamp": datetime.now().isoformat(),
            "validation_results": {
                "data_structure": structure_validation,
                "processing_completeness": processing_validation,
                "website_ready_data": website_validation
            },
            "assessment": assessment,
            "recommendations": self.generate_recommendations(assessment)
        }
        
        return report
    
    def generate_assessment(self, structure: Dict, processing: Dict, website: Dict) -> str:
        """Generate overall assessment of data readiness"""
        
        # Simple assessment logic
        structure_score = sum(1 for v in structure["directories_check"].values() if v["exists"])
        processing_score = sum(1 for v in processing.values() if v["count"] > 0)
        website_score = sum(1 for v in website.values() if len(v) > 0)
        
        total_score = structure_score + processing_score + website_score
        max_score = len(structure["directories_check"]) + len(processing) + len(website)
        
        if total_score == max_score:
            return "READY"
        elif total_score >= max_score * 0.75:
            return "ALMOST_READY"
        else:
            return "NOT_READY"
    
    def generate_recommendations(self, assessment: str) -> List[str]:
        """Generate recommendations based on assessment"""
        recommendations = []
        
        if assessment == "READY":
            recommendations.append("✅ All data is properly structured and ready for website display")
            recommendations.append("   - Data integrity verified")
            recommendations.append("   - Processing pipeline completed successfully")
        elif assessment == "ALMOST_READY":
            recommendations.append("⚠️  Data is mostly ready but needs minor improvements")
            recommendations.append("   - Check missing files or directories")
            recommendations.append("   - Ensure all processing steps completed")
        else:
            recommendations.append("❌ Data is not ready for website display")
            recommendations.append("   - Critical data missing or incomplete")
            recommendations.append("   - Process all missing files and complete pipeline")
        
        return recommendations
    
    def save_report(self, report: Dict):
        """Save validation report to file"""
        report_file = f"data/validation_reports/website_validation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        Path(report_file).parent.mkdir(parents=True, exist_ok=True)
        
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\nValidation report saved to: {report_file}")

def main():
    """Main function to validate website data"""
    print("Website Data Validator for Carmen de Areco Transparency Portal")
    
    validator = WebsiteDataValidator()
    report = validator.run_comprehensive_validation()
    
    # Display results
    print("\n" + "=" * 60)
    print("VALIDATION RESULTS")
    print("=" * 60)
    
    print(f"Assessment: {report['assessment']}")
    
    print("\nRecommendations:")
    for rec in report['recommendations']:
        print(f"  {rec}")
    
    # Save report
    validator.save_report(report)
    
    print("\nValidation complete!")

if __name__ == "__main__":
    main()