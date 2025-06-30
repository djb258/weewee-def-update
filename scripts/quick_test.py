#!/usr/bin/env python3
"""
Quick Test Script
Tests basic functionality to see what's working
"""

import subprocess
import os
import sys

def run_test(command, description):
    """Run a test command and return result"""
    print(f"🧪 Testing: {description}")
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            capture_output=True, 
            encoding='utf-8', 
            errors='replace', 
            timeout=30
        )
        
        if result.returncode == 0:
            print(f"✅ {description} - PASSED")
            return True
        else:
            print(f"❌ {description} - FAILED")
            if result.stderr:
                print(f"   Error: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"❌ {description} - ERROR: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🔧 Cursor Blueprint Enforcer - Quick Test")
    print("=" * 50)
    
    tests = [
        ("npm run sync-cursor export", "Cursor Config Export"),
        ("npm run generate-summary", "Generate Summary"),
        ("npm run build", "TypeScript Build"),
        ("npm run lint", "Code Linting"),
    ]
    
    passed = 0
    total = len(tests)
    
    for command, description in tests:
        if run_test(command, description):
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The system is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        print("\n💡 Common issues:")
        print("   - Missing environment variables (check .env file)")
        print("   - Missing API keys for external services")
        print("   - Network connectivity issues")
        print("   - Missing dependencies")

if __name__ == "__main__":
    main() 