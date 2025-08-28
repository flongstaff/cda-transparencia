#!/usr/bin/env python3
"""
Test script for the enhanced audit components
"""

import sys
from pathlib import Path

# Add the project root to the path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

def test_imports():
    """Test that all new components can be imported"""
    try:
        from scripts.audit.financial_irregularity_tracker import FinancialIrregularityTracker
        print("✅ FinancialIrregularityTracker imported successfully")
    except Exception as e:
        print(f"❌ Failed to import FinancialIrregularityTracker: {e}")
        return False
    
    try:
        from scripts.audit.infrastructure_project_tracker import InfrastructureProjectTracker
        print("✅ InfrastructureProjectTracker imported successfully")
    except Exception as e:
        print(f"❌ Failed to import InfrastructureProjectTracker: {e}")
        return False
    
    try:
        from scripts.audit.unified_audit_dashboard import UnifiedAuditDashboard
        print("✅ UnifiedAuditDashboard imported successfully")
    except Exception as e:
        print(f"❌ Failed to import UnifiedAuditDashboard: {e}")
        return False
    
    return True

def test_instantiation():
    """Test that components can be instantiated"""
    try:
        from scripts.audit.financial_irregularity_tracker import FinancialIrregularityTracker
        tracker = FinancialIrregularityTracker()
        print("✅ FinancialIrregularityTracker instantiated successfully")
    except Exception as e:
        print(f"❌ Failed to instantiate FinancialIrregularityTracker: {e}")
        return False
    
    try:
        from scripts.audit.infrastructure_project_tracker import InfrastructureProjectTracker
        tracker = InfrastructureProjectTracker()
        print("✅ InfrastructureProjectTracker instantiated successfully")
    except Exception as e:
        print(f"❌ Failed to instantiate InfrastructureProjectTracker: {e}")
        return False
    
    try:
        from scripts.audit.unified_audit_dashboard import UnifiedAuditDashboard
        dashboard = UnifiedAuditDashboard()
        print("✅ UnifiedAuditDashboard instantiated successfully")
    except Exception as e:
        print(f"❌ Failed to instantiate UnifiedAuditDashboard: {e}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("🧪 Testing Enhanced Audit Components")
    print("=" * 50)
    
    # Test imports
    print("\n🔍 Testing imports...")
    if not test_imports():
        return 1
    
    # Test instantiation
    print("\n🔧 Testing instantiation...")
    if not test_instantiation():
        return 1
    
    print("\n🎉 All tests passed!")
    return 0

if __name__ == "__main__":
    exit(main())