#!/usr/bin/env python3
"""
Complete Carmen de Areco Transparency Audit System
Integration of all audit tools and frameworks
"""

import sys
import os
from pathlib import Path
import json
from datetime import datetime
import argparse
import time

# Add our modules to path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir / "audit"))
sys.path.append(str(current_dir / "scrapers"))
sys.path.append(str(current_dir / "osint"))

def display_banner():
    """Display system banner"""
    print("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🏛️  CARMEN DE ARECO TRANSPARENCY AUDIT SYSTEM 🏛️         ║
║                                                              ║
║         Comprehensive Municipal Transparency Analysis        ║
║              Using Argentine-Specific Tools                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    """)

def run_quick_audit():
    """Run 5-minute quick audit"""
    print("🚀 Starting Quick Audit (5 minutes)")
    print("=" * 60)
    
    try:
        from run_quick_audit import main as quick_main
        result = quick_main()
        return {"success": True, "type": "quick", "result": result}
    except Exception as e:
        print(f"❌ Quick audit failed: {e}")
        return {"success": False, "error": str(e)}

def run_enhanced_audit():
    """Run comprehensive enhanced audit"""
    print("🔬 Starting Enhanced Audit (30-60 minutes)")
    print("=" * 60)
    
    try:
        from audit.carmen_areco_enhanced_auditor import EnhancedCarmenArecoAuditor
        auditor = EnhancedCarmenArecoAuditor()
        results = auditor.run_complete_audit()
        return {"success": True, "type": "enhanced", "result": results}
    except Exception as e:
        print(f"❌ Enhanced audit failed: {e}")
        return {"success": False, "error": str(e)}

def run_osint_analysis():
    """Run OSINT analysis"""
    print("🕵️ Starting OSINT Analysis (45-90 minutes)")
    print("=" * 60)
    
    try:
        from osint.municipality_osint_framework import MunicipalityOSINTFramework
        osint = MunicipalityOSINTFramework()
        results = osint.run_comprehensive_analysis()
        return {"success": True, "type": "osint", "result": results}
    except Exception as e:
        print(f"❌ OSINT analysis failed: {e}")
        return {"success": False, "error": str(e)}

def run_pdf_extraction():
    """Run PDF data extraction"""
    print("📄 Starting PDF Data Extraction")
    print("=" * 60)
    
    try:
        from scrapers.pdf_extractor import ArgentinePDFProcessor
        pdf_processor = ArgentinePDFProcessor()
        results = pdf_processor.process_all_documents()
        return {"success": True, "type": "pdf", "result": results}
    except Exception as e:
        print(f"❌ PDF extraction failed: {e}")
        return {"success": False, "error": str(e)}

def run_bora_scraping():
    """Run BORA scraping"""
    print("📜 Starting BORA Scraping")
    print("=" * 60)
    
    try:
        from scrapers.bora_scraper import BORAScraperCarmenDeAreco
        bora_scraper = BORAScraperCarmenDeAreco()
        results = bora_scraper.scrape_all_sources()
        return {"success": True, "type": "bora", "result": results}
    except Exception as e:
        print(f"❌ BORA scraping failed: {e}")
        return {"success": False, "error": str(e)}

def run_financial_irregularity_audit():
    """Run financial irregularity tracking"""
    print("💰 Starting Financial Irregularity Audit (10-15 minutes)")
    print("=" * 60)
    
    try:
        from audit.financial_irregularity_tracker import FinancialIrregularityTracker
        tracker = FinancialIrregularityTracker()
        results = tracker.run_full_audit()
        return {"success": True, "type": "financial_irregularity", "result": results}
    except Exception as e:
        print(f"❌ Financial irregularity audit failed: {e}")
        return {"success": False, "error": str(e)}

def run_infrastructure_audit():
    """Run infrastructure project tracking"""
    print("🏗️ Starting Infrastructure Project Audit (15-20 minutes)")
    print("=" * 60)
    
    try:
        from audit.infrastructure_project_tracker import InfrastructureProjectTracker
        tracker = InfrastructureProjectTracker()
        results = tracker.run_full_tracking()
        return {"success": True, "type": "infrastructure", "result": results}
    except Exception as e:
        print(f"❌ Infrastructure audit failed: {e}")
        return {"success": False, "error": str(e)}

def run_enhanced_discovery():
    """Run enhanced document discovery"""
    print("🔍 Starting Enhanced Document Discovery")
    print("=" * 60)
    
    try:
        from audit.enhanced_document_discovery import EnhancedDocumentDiscovery
        discovery = EnhancedDocumentDiscovery()
        results = discovery.run_complete_discovery()
        return {"success": True, "type": "enhanced_discovery", "result": results}
    except Exception as e:
        print(f"❌ Enhanced discovery failed: {e}")
        return {"success": False, "error": str(e)}

def run_powerbi_extraction():
    """Run PowerBI data extraction"""
    print("🔓 Starting PowerBI Data Extraction")
    print("=" * 60)
    
    try:
        from audit.powerbi_data_extractor import PowerBIDataExtractor
        extractor = PowerBIDataExtractor()
        results = extractor.run_complete_extraction()
        return {"success": True, "type": "powerbi_extraction", "result": results}
    except Exception as e:
        print(f"❌ PowerBI extraction failed: {e}")
        return {"success": False, "error": str(e)}

def run_data_categorization():
    """Run data categorization system"""
    print("🏷️ Starting Data Categorization System")
    print("=" * 60)
    
    try:
        from audit.data_categorization_system import DataCategorizationSystem
        categorizer = DataCategorizationSystem()
        results = categorizer.run_complete_categorization()
        return {"success": True, "type": "data_categorization", "result": results}
    except Exception as e:
        print(f"❌ Data categorization failed: {e}")
        return {"success": False, "error": str(e)}

def run_complete_audit():
    """Run complete unified audit dashboard"""
    print("📊 Starting Complete Unified Audit Dashboard (20-30 minutes)")
    print("=" * 60)
    
    try:
        from audit.unified_audit_dashboard import UnifiedAuditDashboard
        dashboard = UnifiedAuditDashboard()
        results = dashboard.run_complete_dashboard()
        return {"success": True, "type": "complete", "result": results}
    except Exception as e:
        print(f"❌ Complete audit failed: {e}")
        return {"success": False, "error": str(e)}

def run_master_system():
    """Run complete master data system"""
    print("🎯 Starting Master Data System (Complete Solution)")
    print("=" * 60)
    
    try:
        from audit.master_data_system import MasterDataSystem
        master = MasterDataSystem()
        exit_code = master.run_complete_system()
        return {"success": True, "type": "master", "result": {"exit_code": exit_code}}
    except Exception as e:
        print(f"❌ Master system failed: {e}")
        return {"success": False, "error": str(e)}

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        ("requests", "requests"),
        ("pandas", "pandas"), 
        ("numpy", "numpy"),
        ("matplotlib", "matplotlib"),
        ("seaborn", "seaborn"),
        ("beautifulsoup4", "bs4"),
        ("networkx", "networkx")
    ]
    
    missing_packages = []
    
    for display_name, import_name in required_packages:
        try:
            __import__(import_name)
        except ImportError:
            missing_packages.append(display_name)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   • {package}")
        print(f"\n📥 Install with: pip install {' '.join(missing_packages)}")
        return False
    
    return True

def setup_directories():
    """Setup required directories"""
    directories = [
        "data/reports",
        "data/documents", 
        "data/pdf_extracts",
        "data/bora_scrape",
        "data/osint",
        "data/enhanced_audit",
        "data/quick_download"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    print("✅ Directories setup complete")

def display_menu():
    """Display main menu"""
    print("\n📋 AVAILABLE AUDIT OPTIONS:")
    print("=" * 40)
    print("1. 🚀 Quick Audit (5 minutes)")
    print("   • Download key documents")
    print("   • Basic transparency analysis")
    print("   • Legal compliance check")
    print("   • Immediate results")
    print()
    print("2. 🔬 Enhanced Audit (30-60 minutes)")
    print("   • Comprehensive document analysis")
    print("   • PowerBI integration")
    print("   • Red flag detection")
    print("   • Legal compliance assessment")
    print()
    print("3. 🕵️ OSINT Analysis (45-90 minutes)")
    print("   • Digital footprint analysis")
    print("   • Personnel network mapping")
    print("   • Media coverage analysis")
    print("   • Risk assessment")
    print()
    print("4. 📄 PDF Extraction Only")
    print("   • Extract data from official PDFs")
    print("   • Table extraction")
    print("   • Document analysis")
    print()
    print("5. 📰 BORA Scraping Only")
    print("   • Boletín Oficial search")
    print("   • Historical data collection")
    print("   • Cross-reference analysis")
    print()
    print("6. 💰 Financial Irregularity Tracking")
    print("   • Salary analysis")
    print("   • Budget discrepancy detection")
    print("   • Project delay monitoring")
    print()
    print("7. 🏗️ Infrastructure Project Tracking")
    print("   • Project status monitoring")
    print("   • Budget vs actual spending")
    print("   • Timeline analysis")
    print()
    print("8. 🔍 Enhanced Document Discovery")
    print("   • Advanced web scraping")
    print("   • Deep document search")
    print("   • Metadata extraction")
    print()
    print("9. 🔓 PowerBI Data Extraction")
    print("   • Government dashboard access")
    print("   • Data integration")
    print("   • Visualization preparation")
    print()
    print("10. 🏷️ Data Categorization System")
    print("    • Document classification")
    print("    • Content analysis")
    print("    • Tagging system")
    print()
    print("11. 📊 Complete Audit Dashboard")
    print("    • Unified analytics")
    print("    • Cross-component analysis")
    print("    • Reporting dashboard")
    print()
    print("12. 🎯 Master Data System")
    print("    • Complete solution")
    print("    • All components integrated")
    print("    • Final reporting")
    print()
    print("13. 🚀 Run All Components")
    print("    • Complete audit suite")
    print("    • Maximum coverage")
    print("    • Comprehensive analysis")
    print()
    print("0. Exit")

def run_complete_audit_suite():
    """Run complete audit suite with all tools"""
    print("🎯 Starting Complete Audit Suite")
    print("⏱️  Estimated time: 2-4 hours")
    print("=" * 60)
    
    suite_results = {
        "start_time": datetime.now().isoformat(),
        "components": {},
        "overall_success": True,
        "errors": []
    }
    
    components = [
        ("Quick Audit", run_quick_audit),
        ("PDF Extraction", run_pdf_extraction),
        ("BORA Scraping", run_bora_scraping),
        ("Enhanced Audit", run_enhanced_audit),
        ("OSINT Analysis", run_osint_analysis)
    ]
    
    for component_name, component_func in components:
        print(f"\n▶️  Running {component_name}...")
        try:
            result = component_func()
            suite_results["components"][component_name] = result
            
            if not result.get("success", False):
                suite_results["overall_success"] = False
                suite_results["errors"].append(f"{component_name}: {result.get('error', 'Unknown error')}")
                print(f"⚠️  {component_name} completed with errors")
            else:
                print(f"✅ {component_name} completed successfully")
                
        except Exception as e:
            print(f"❌ {component_name} failed: {e}")
            suite_results["overall_success"] = False
            suite_results["errors"].append(f"{component_name}: {str(e)}")
            suite_results["components"][component_name] = {"success": False, "error": str(e)}
    
    suite_results["end_time"] = datetime.now().isoformat()
    suite_results["duration_hours"] = (datetime.fromisoformat(suite_results["end_time"]) - 
                                     datetime.fromisoformat(suite_results["start_time"])).total_seconds() / 3600
    
    # Save comprehensive results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = Path("data/reports") / f"complete_audit_suite_{timestamp}.json"
    
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(suite_results, f, ensure_ascii=False, indent=2, default=str)
    
    # Display summary
    print("\n" + "=" * 60)
    print("🎯 COMPLETE AUDIT SUITE RESULTS")
    print("=" * 60)
    
    successful = sum(1 for result in suite_results["components"].values() if result.get("success", False))
    total = len(suite_results["components"])
    
    print(f"📊 Components Completed: {successful}/{total}")
    print(f"⏱️  Total Duration: {suite_results['duration_hours']:.1f} hours")
    print(f"📄 Results saved to: {results_file}")
    
    if suite_results["errors"]:
        print(f"\n⚠️  Errors encountered:")
        for error in suite_results["errors"]:
            print(f"   • {error}")
    
    print(f"\n✅ Complete audit suite finished")
    return suite_results

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Carmen de Areco Transparency Audit System")
    parser.add_argument("--quick", action="store_true", help="Run 5-minute quick audit")
    parser.add_argument("--enhanced", action="store_true", help="Run comprehensive enhanced audit")
    parser.add_argument("--osint", action="store_true", help="Run OSINT analysis")
    parser.add_argument("--pdf", action="store_true", help="Run PDF data extraction")
    parser.add_argument("--bora", action="store_true", help="Run BORA scraping")
    parser.add_argument("--financial-irregularity", action="store_true", help="Run financial irregularity tracking")
    parser.add_argument("--infrastructure", action="store_true", help="Run infrastructure project tracking")
    parser.add_argument("--enhanced-discovery", action="store_true", help="Run enhanced document discovery")
    parser.add_argument("--powerbi-extraction", action="store_true", help="Run PowerBI data extraction")
    parser.add_argument("--data-categorization", action="store_true", help="Run data categorization system")
    parser.add_argument("--complete", action="store_true", help="Run complete audit suite")
    parser.add_argument("--master", action="store_true", help="Run complete master data system")
    parser.add_argument("--all", action="store_true", help="Run all audit components")
    parser.add_argument("--no-deps-check", action="store_true", help="Skip dependency check")
    
    args = parser.parse_args()
    
    display_banner()
    
    # Check dependencies unless skipped
    if not args.no_deps_check:
        print("🔍 Checking dependencies...")
        if not check_dependencies():
            return 1
        print("✅ Dependencies OK")
    
    # Setup directories
    print("📁 Setting up directories...")
    setup_directories()
    
    # Run selected audits
    results = []
    
    if args.quick or args.all:
        results.append(run_quick_audit())
    
    if args.enhanced or args.all:
        results.append(run_enhanced_audit())
    
    if args.osint or args.all:
        results.append(run_osint_analysis())
    
    if args.pdf or args.all:
        results.append(run_pdf_extraction())
    
    if args.bora or args.all:
        results.append(run_bora_scraping())
    
    if args.financial_irregularity or args.all:
        results.append(run_financial_irregularity_audit())
    
    if args.infrastructure or args.all:
        results.append(run_infrastructure_audit())
    
    if args.enhanced_discovery or args.all:
        results.append(run_enhanced_discovery())
    
    if args.powerbi_extraction or args.all:
        results.append(run_powerbi_extraction())
    
    if args.data_categorization or args.all:
        results.append(run_data_categorization())
    
    if args.complete or args.all:
        results.append(run_complete_audit())
    
    if args.master or args.all:
        results.append(run_master_system())
    
    # If no arguments provided, show interactive menu
    if not any([args.quick, args.enhanced, args.osint, args.pdf, args.bora, 
                args.financial_irregularity, args.infrastructure, args.enhanced_discovery,
                args.powerbi_extraction, args.data_categorization, args.complete, 
                args.master, args.all]):
        # Interactive mode
        while True:
            display_menu()
            
            try:
                choice = input("\n🎯 Select option (0-13): ").strip()
                
                if choice == "0":
                    print("👋 Goodbye!")
                    break
                elif choice == "1":
                    run_quick_audit()
                elif choice == "2":
                    run_enhanced_audit()
                elif choice == "3":
                    run_osint_analysis()
                elif choice == "4":
                    run_pdf_extraction()
                elif choice == "5":
                    run_bora_scraping()
                elif choice == "6":
                    run_financial_irregularity_audit()
                elif choice == "7":
                    run_infrastructure_audit()
                elif choice == "8":
                    run_enhanced_discovery()
                elif choice == "9":
                    run_powerbi_extraction()
                elif choice == "10":
                    run_data_categorization()
                elif choice == "11":
                    run_complete_audit()
                elif choice == "12":
                    run_master_system()
                elif choice == "13":
                    # Run all components
                    run_quick_audit()
                    run_enhanced_audit()
                    run_osint_analysis()
                    run_pdf_extraction()
                    run_bora_scraping()
                    run_financial_irregularity_audit()
                    run_infrastructure_audit()
                    run_enhanced_discovery()
                    run_powerbi_extraction()
                    run_data_categorization()
                    run_complete_audit()
                    run_master_system()
                else:
                    print("❌ Invalid option. Please try again.")
                    continue
                
                print("\n" + "="*60)
                input("Press Enter to continue...")
                
            except KeyboardInterrupt:
                print("\n👋 Audit interrupted by user. Goodbye!")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}")
                input("Press Enter to continue...")
        
        return 0
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 AUDIT SYSTEM SUMMARY")
    print("=" * 60)
    
    successful = sum(1 for r in results if r.get("success"))
    failed = len(results) - successful
    
    print(f"Total Components Run: {len(results)}")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    
    if failed > 0:
        print("\n❌ Some components failed. Check output above for details.")
        return 1
    else:
        print("\n🎉 All audit components completed successfully!")
        return 0

if __name__ == "__main__":
    exit_code = main()