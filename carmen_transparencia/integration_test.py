#!/usr/bin/env python3
"""
Integration test to verify that the CLI commands work correctly.
"""

import subprocess
import sys
import os

def run_command(cmd, description):
    """Run a command and check if it succeeds."""
    print(f"🔧 {description}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print(f"✅ Command succeeded")
            return True
        else:
            print(f"❌ Command failed with return code {result.returncode}")
            print(f"stderr: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print("❌ Command timed out")
        return False
    except Exception as e:
        print(f"❌ Command failed with exception: {e}")
        return False

def main():
    """Run integration tests."""
    print("🧪 Running integration tests for Carmen de Areco Transparency CLI...\n")
    
    # Test help commands
    tests = [
        ("carmen-transparencia --help", "Testing main help"),
        ("carmen-transparencia scrape --help", "Testing scrape help"),
        ("carmen-transparencia process --help", "Testing process help"),
        ("carmen-transparencia populate --help", "Testing populate help"),
    ]
    
    all_passed = True
    for cmd, description in tests:
        if not run_command(cmd, description):
            all_passed = False
    
    if all_passed:
        print("\n🎉 All integration tests passed!")
        return 0
    else:
        print("\n💥 Some integration tests failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())