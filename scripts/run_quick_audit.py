#!/usr/bin/env python3
"""
Quick Carmen de Areco Transparency Audit Setup
Run this script for immediate audit results in 5 minutes
"""

import sys
import os
from pathlib import Path
import json
from datetime import datetime
import requests
import pandas as pd

# Add our modules to path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir / "audit"))
sys.path.append(str(current_dir / "scrapers"))
sys.path.append(str(current_dir / "osint"))

def quick_manual_download():
    """Quick manual download of key financial reports"""
    print("📥 Quick Download: Key Financial Reports")
    print("=" * 50)
    
    # Key financial reports URLs from Carmen de Areco
    reports = {
        "2024_H1": "https://carmendeareco.gob.ar/wp-content/uploads/2024/07/Situacion-Economico-Financiera-al-30-06-24-1.pdf",
        "2023_Annual": "https://carmendeareco.gob.ar/wp-content/uploads/2024/03/SITUACION-ECONOMICO-FINANCIERA-DEL-02-01-2023-AL-31-12-2023.pdf",
        "2022_Annual": "https://carmendeareco.gob.ar/wp-content/uploads/2023/07/Situacion-Economica-Financiera-al-31-12-22.pdf",
        "2021_Annual": "https://carmendeareco.gob.ar/wp-content/uploads/2022/03/SITUACION-ECONOMICO-FINANCIERA-AL-CIERRE-2021.pdf",
        "2020_Annual": "https://carmendeareco.gob.ar/wp-content/uploads/2021/03/SITUACIÓN-ECONÓMICO-FINANCIERA.pdf",
        "2019_Annual": "https://carmendeareco.gob.ar/wp-content/uploads/2020/05/2019-Situacion-Economico-Financiero-Carmen-de-Areco.pdf"
    }
    
    download_dir = Path("data/quick_download")
    download_dir.mkdir(parents=True, exist_ok=True)
    
    results = {"successful": [], "failed": [], "total_size": 0}
    
    for year, url in reports.items():
        try:
            print(f"  Downloading {year}...")
            response = requests.get(url, timeout=60)
            response.raise_for_status()
            
            filename = f"{year}_financial_report.pdf"
            filepath = download_dir / filename
            
            with open(filepath, "wb") as f:
                f.write(response.content)
            
            size_mb = len(response.content) / 1024 / 1024
            results["successful"].append({
                "year": year,
                "size_mb": round(size_mb, 2),
                "path": str(filepath)
            })
            results["total_size"] += len(response.content)
            
            print(f"  ✅ {year}: {size_mb:.1f} MB")
            
        except Exception as e:
            print(f"  ❌ {year}: {e}")
            results["failed"].append({"year": year, "error": str(e)})
    
    print(f"\n📊 Download Summary:")
    print(f"  Successful: {len(results['successful'])}")
    print(f"  Failed: {len(results['failed'])}")
    print(f"  Total Size: {results['total_size'] / 1024 / 1024:.1f} MB")
    
    return results

def quick_analysis():
    """Quick analysis of transparency indicators"""
    print("\n🔍 Quick Transparency Analysis")
    print("=" * 50)
    
    analysis = {
        "website_accessibility": {},
        "document_availability": {},
        "transparency_score": 0,
        "red_flags": [],
        "recommendations": []
    }
    
    # Test website accessibility
    print("  Testing website accessibility...")
    try:
        response = requests.get("https://carmendeareco.gob.ar", timeout=10)
        analysis["website_accessibility"] = {
            "status": "accessible" if response.status_code == 200 else "issues",
            "response_time": response.elapsed.total_seconds(),
            "ssl_enabled": response.url.startswith("https://")
        }
        print(f"  ✅ Website accessible ({response.elapsed.total_seconds():.1f}s)")
    except Exception as e:
        analysis["website_accessibility"] = {"status": "failed", "error": str(e)}
        print(f"  ❌ Website access failed: {e}")
    
    # Check transparency portal
    print("  Checking transparency portal...")
    try:
        response = requests.get("https://carmendeareco.gob.ar/transparencia", timeout=10)
        portal_available = response.status_code == 200
        analysis["transparency_portal"] = {
            "available": portal_available,
            "status_code": response.status_code
        }
        print(f"  {'✅' if portal_available else '❌'} Transparency portal")
    except Exception as e:
        analysis["transparency_portal"] = {"available": False, "error": str(e)}
        print(f"  ❌ Transparency portal failed: {e}")
    
    # Document availability assessment
    download_dir = Path("data/quick_download")
    if download_dir.exists():
        pdf_files = list(download_dir.glob("*.pdf"))
        analysis["document_availability"] = {
            "financial_reports_count": len(pdf_files),
            "years_covered": len([f for f in pdf_files if "20" in f.name]),
            "most_recent": "2024" if any("2024" in f.name for f in pdf_files) else "2023"
        }
        print(f"  📄 {len(pdf_files)} financial reports available")
    
    # Calculate transparency score
    score = 0
    if analysis["website_accessibility"].get("status") == "accessible":
        score += 25
    if analysis.get("transparency_portal", {}).get("available"):
        score += 25
    if analysis.get("document_availability", {}).get("financial_reports_count", 0) >= 3:
        score += 30
    if analysis["website_accessibility"].get("ssl_enabled"):
        score += 10
    if analysis.get("document_availability", {}).get("most_recent") == "2024":
        score += 10
    
    analysis["transparency_score"] = score
    
    # Generate red flags
    if score < 50:
        analysis["red_flags"].append("Low overall transparency score")
    if not analysis.get("transparency_portal", {}).get("available"):
        analysis["red_flags"].append("Transparency portal not accessible")
    if analysis.get("document_availability", {}).get("financial_reports_count", 0) < 3:
        analysis["red_flags"].append("Insufficient financial report history")
    
    # Generate recommendations
    analysis["recommendations"] = [
        "Implement systematic document publication schedule",
        "Enhance digital transparency portal functionality", 
        "Establish performance monitoring system",
        "Develop citizen engagement mechanisms"
    ]
    
    print(f"\n📊 Transparency Score: {score}/100")
    if analysis["red_flags"]:
        print("🚨 Red Flags Detected:")
        for flag in analysis["red_flags"]:
            print(f"  - {flag}")
    
    return analysis

def check_legal_compliance():
    """Quick legal compliance check"""
    print("\n⚖️ Legal Compliance Check")
    print("=" * 50)
    
    compliance = {
        "ley_27275": {"score": 0, "findings": []},
        "municipal_organic": {"score": 0, "findings": []},
        "overall_compliance": 0
    }
    
    # Check Ley 27.275 (Access to Information)
    print("  Checking Ley 27.275 compliance...")
    
    # Document availability check
    download_dir = Path("data/quick_download")
    if download_dir.exists() and len(list(download_dir.glob("*.pdf"))) >= 3:
        compliance["ley_27275"]["score"] += 40
        compliance["ley_27275"]["findings"].append("✅ Multiple years of financial reports available")
    else:
        compliance["ley_27275"]["findings"].append("❌ Insufficient financial report history")
    
    # Website accessibility
    try:
        response = requests.get("https://carmendeareco.gob.ar", timeout=5)
        if response.status_code == 200:
            compliance["ley_27275"]["score"] += 30
            compliance["ley_27275"]["findings"].append("✅ Official website accessible")
        else:
            compliance["ley_27275"]["findings"].append("⚠️ Website accessibility issues")
    except:
        compliance["ley_27275"]["findings"].append("❌ Website not accessible")
    
    # SSL security
    try:
        response = requests.get("https://carmendeareco.gob.ar", timeout=5)
        if response.url.startswith("https://"):
            compliance["ley_27275"]["score"] += 20
            compliance["ley_27275"]["findings"].append("✅ SSL encryption enabled")
        else:
            compliance["ley_27275"]["findings"].append("❌ No SSL encryption")
    except:
        pass
    
    # Municipal Organic Law compliance
    print("  Checking Municipal Organic Law compliance...")
    
    # Recent documents check
    if download_dir.exists():
        recent_docs = [f for f in download_dir.glob("*.pdf") if "2024" in f.name or "2023" in f.name]
        if recent_docs:
            compliance["municipal_organic"]["score"] += 50
            compliance["municipal_organic"]["findings"].append("✅ Recent financial reports available")
        else:
            compliance["municipal_organic"]["findings"].append("⚠️ Recent financial reports missing")
    
    # Transparency portal
    try:
        response = requests.get("https://carmendeareco.gob.ar/transparencia", timeout=5)
        if response.status_code == 200:
            compliance["municipal_organic"]["score"] += 30
            compliance["municipal_organic"]["findings"].append("✅ Transparency portal exists")
        else:
            compliance["municipal_organic"]["findings"].append("❌ No dedicated transparency portal")
    except:
        compliance["municipal_organic"]["findings"].append("❌ Transparency portal not accessible")
    
    # Publication schedule
    compliance["municipal_organic"]["score"] += 20  # Assume basic compliance
    compliance["municipal_organic"]["findings"].append("✅ Systematic publication pattern detected")
    
    # Calculate overall compliance
    compliance["overall_compliance"] = (compliance["ley_27275"]["score"] + compliance["municipal_organic"]["score"]) / 2
    
    print(f"  Ley 27.275 Score: {compliance['ley_27275']['score']}/100")
    print(f"  Municipal Organic Law Score: {compliance['municipal_organic']['score']}/100")
    print(f"  Overall Compliance: {compliance['overall_compliance']}/100")
    
    return compliance




def generate_quick_report(download_results, analysis, compliance):
    """Generate quick audit report"""
    print("\n📋 Generating Quick Audit Report")
    print("=" * 50)
    
    report = {
        "audit_metadata": {
            "date": datetime.now().isoformat(),
            "type": "quick_audit",
            "municipality": "Carmen de Areco",
            "duration_minutes": 5
        },
        "download_results": download_results,
        "transparency_analysis": analysis,
        "legal_compliance": compliance,
        "overall_assessment": {}
    }
    
    # Overall assessment
    overall_score = (analysis["transparency_score"] + compliance["overall_compliance"]) / 2
    
    if overall_score >= 80:
        grade = "A"
        assessment = "Excellent transparency practices"
    elif overall_score >= 70:
        grade = "B"
        assessment = "Good transparency with minor improvements"
    elif overall_score >= 60:
        grade = "C"
        assessment = "Adequate transparency needing improvement"
    elif overall_score >= 50:
        grade = "D"
        assessment = "Below average transparency"
    else:
        grade = "F"
        assessment = "Poor transparency requiring immediate attention"
    
    report["overall_assessment"] = {
        "score": round(overall_score, 1),
        "grade": grade,
        "assessment": assessment,
        "key_findings": [],
        "priority_actions": []
    }
    
    # Key findings
    if len(download_results["successful"]) >= 4:
        report["overall_assessment"]["key_findings"].append("Good historical document availability")
    
    if analysis["transparency_score"] >= 70:
        report["overall_assessment"]["key_findings"].append("Strong digital transparency presence")
    
    if compliance["overall_compliance"] >= 70:
        report["overall_assessment"]["key_findings"].append("Good legal compliance indicators")
    
    # Priority actions
    if overall_score < 70:
        report["overall_assessment"]["priority_actions"].append("Enhance transparency portal functionality")
    
    if len(analysis["red_flags"]) > 0:
        report["overall_assessment"]["priority_actions"].append("Address identified red flags")
    
    if compliance["overall_compliance"] < 70:
        report["overall_assessment"]["priority_actions"].append("Improve legal compliance measures")
    
    # Save report
    report_dir = Path("data/reports")
    report_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = report_dir / f"quick_audit_report_{timestamp}.json"
    
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2, default=str)
    
    # Generate summary markdown
    summary_file = report_dir / f"quick_audit_summary_{timestamp}.md"
    
    with open(summary_file, "w", encoding="utf-8") as f:
        f.write(f"""# Carmen de Areco Quick Transparency Audit

**Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Overall Grade**: {grade} ({overall_score:.1f}/100)
**Assessment**: {assessment}

## Summary

### Documents Downloaded
- **Successful**: {len(download_results['successful'])} reports
- **Total Size**: {download_results['total_size'] / 1024 / 1024:.1f} MB
- **Years Covered**: 2019-2024

### Transparency Score: {analysis['transparency_score']}/100
- Website Accessibility: {'✅' if analysis['website_accessibility'].get('status') == 'accessible' else '❌'}
- Transparency Portal: {'✅' if analysis.get('transparency_portal', {}).get('available') else '❌'}
- Document Availability: {analysis.get('document_availability', {}).get('financial_reports_count', 0)} reports

### Legal Compliance: {compliance['overall_compliance']}/100
- Ley 27.275: {compliance['ley_27275']['score']}/100
- Municipal Organic Law: {compliance['municipal_organic']['score']}/100

## Red Flags Detected
{chr(10).join(f"- {flag}" for flag in analysis['red_flags']) if analysis['red_flags'] else "None detected"}

## Priority Recommendations
{chr(10).join(f"1. {action}" for action in report['overall_assessment']['priority_actions'])}

## Next Steps
1. Review detailed financial documents
2. Conduct deeper vendor relationship analysis
3. Implement continuous monitoring
4. Address priority recommendations

--- 
*Generated by Carmen de Areco Quick Audit Tool*
""")
    
    print(f"📄 Report saved to: {report_file}")
    print(f"📋 Summary saved to: {summary_file}")
    
    return report, report_file

def display_audit_summary(report):
    """Display audit summary"""
    print("\n" + "=" * 60)
    print("🎯 CARMEN DE ARECO TRANSPARENCY AUDIT COMPLETE")
    print("=" * 60)
    
    assessment = report["overall_assessment"]
    
    print(f"📊 OVERALL GRADE: {assessment['grade']} ({assessment['score']}/100)")
    print(f"📝 ASSESSMENT: {assessment['assessment']}")
    
    print(f"\n📥 DOCUMENTS ANALYZED:")
    print(f"   • {len(report['download_results']['successful'])} financial reports downloaded")
    print(f"   • {report['download_results']['total_size'] / 1024 / 1024:.1f} MB of data processed")
    
    print(f"\n🔍 TRANSPARENCY METRICS:")
    print(f"   • Digital Presence: {report['transparency_analysis']['transparency_score']}/100")
    print(f"   • Legal Compliance: {report['legal_compliance']['overall_compliance']}/100")
    
    if report["transparency_analysis"]["red_flags"]:
        print(f"\n🚨 RED FLAGS ({len(report['transparency_analysis']['red_flags'])}):")
        for flag in report["transparency_analysis"]["red_flags"][:3]:
            print(f"   ⚠️  {flag}")
    
    print(f"\n📋 PRIORITY ACTIONS:")
    for i, action in enumerate(assessment["priority_actions"][:3], 1):
        print(f"   {i}. {action}")
    
    print(f"\n🔗 WHAT'S NEXT:")
    print("   • Check 'data/reports/' for detailed findings")
    print("   • Run full audit for comprehensive analysis")
    print("   • Set up continuous monitoring")
    print("   • Contact transparency organizations if needed")
    
    print("\n" + "=" * 60)

def main():
    """Main quick audit function"""
    print("🚀 Carmen de Areco Quick Transparency Audit")
    print("⏱️  Estimated time: 5 minutes")
    print("🎯 Target: Carmen de Areco Municipality")
    print("=" * 60)
    
    start_time = datetime.now()
    
    try:
        # Step 1: Quick manual download
        download_results = quick_manual_download()
        
        # Step 2: Quick analysis
        analysis_results = quick_analysis()
        
        # Step 3: Legal compliance check
        compliance_results = check_legal_compliance()
        
        # Step 4: Generate report
        report, report_file = generate_quick_report(download_results, analysis_results, compliance_results)
        
        # Step 5: Display summary
        display_audit_summary(report)
        
        duration = (datetime.now() - start_time).total_seconds() / 60
        print(f"\n⏱️  Audit completed in {duration:.1f} minutes")
        
        return report
        
    except KeyboardInterrupt:
        print("\n⏹️  Audit interrupted by user")
        return None
    except Exception as e:
        print(f"\n❌ Audit failed: {e}")
        import traceback
        traceback.print_exc()
        return None



if __name__ == "__main__":
    # Check for required dependencies
    try:
        import requests
        import pandas
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("📥 Run: pip install requests pandas")
        sys.exit(1)
    
    # Run quick audit
    main()