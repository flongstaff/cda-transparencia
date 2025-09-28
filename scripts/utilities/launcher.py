#!/usr/bin/env python3
"""
Working Scripts Launcher
Quick access to your main scripts
"""

import sys
import subprocess
from pathlib import Path

def show_scripts():
    print("📂 Available working scripts:")
    working_dir = Path(__file__).parent
    scripts = sorted(working_dir.glob("*.py"))
    for i, script in enumerate(scripts, 1):
        if script.name != Path(__file__).name:
            print(f"  {i:2}. {script.name}")
    print()

def main():
    if len(sys.argv) < 2:
        print("🚀 Carmen de Areco Working Scripts")
        print()
        show_scripts()
        print("Usage:")
        print("  python3 launcher.py <script_name>")
        print("  python3 launcher.py list")
        print()
        print("Examples:")
        print("  python3 launcher.py process_pdfs.py")
        print("  python3 launcher.py check_data.py")
        return

    command = sys.argv[1]

    if command == "list":
        show_scripts()
        return

    script_path = Path(__file__).parent / command
    if script_path.exists():
        subprocess.run([sys.executable, str(script_path)] + sys.argv[2:])
    else:
        print(f"❌ Script not found: {command}")
        show_scripts()

if __name__ == "__main__":
    main()
