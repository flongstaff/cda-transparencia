#!/usr/bin/env python3
"""
Comprehensive Script Organizer
Audits and organizes ALL scripts across the entire project structure
"""

import os
import ast
import sys
import json
import shutil
import subprocess
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ComprehensiveScriptOrganizer:
    def __init__(self, base_dir: str = "/Users/flong/Developer/cda-transparencia"):
        self.base_dir = Path(base_dir)
        self.scripts_dir = self.base_dir / "scripts"

        # Exclusion patterns
        self.exclude_patterns = [
            "node_modules",
            ".venv",
            "venv",
            ".git",
            "__pycache__",
            "dist",
            "build",
            ".pytest_cache"
        ]

        self.script_inventory = {
            "python_scripts": [],
            "javascript_scripts": [],
            "shell_scripts": [],
            "config_files": [],
            "scattered_scripts": []
        }

    def should_exclude_path(self, path: Path) -> bool:
        """Check if path should be excluded from processing"""
        path_str = str(path)
        return any(pattern in path_str for pattern in self.exclude_patterns)

    def find_all_scripts(self) -> Dict[str, List[Dict]]:
        """Find all scripts across the entire project"""
        logger.info("🔍 Scanning entire project for scripts...")

        # Find Python files
        for py_file in self.base_dir.rglob("*.py"):
            if not self.should_exclude_path(py_file):
                self.script_inventory["python_scripts"].append({
                    "path": str(py_file),
                    "relative_path": str(py_file.relative_to(self.base_dir)),
                    "name": py_file.name,
                    "directory": str(py_file.parent.relative_to(self.base_dir)),
                    "size": py_file.stat().st_size,
                    "modified": datetime.fromtimestamp(py_file.stat().st_mtime).isoformat()
                })

        # Find JavaScript files (excluding React components and configs in certain dirs)
        for js_file in self.base_dir.rglob("*.js"):
            if not self.should_exclude_path(js_file):
                # Skip React component files and certain configs
                if not (
                    "frontend/src/" in str(js_file) or
                    js_file.name in ["vite.config.js", "eslint.config.js", "tailwind.config.js", "postcss.config.js"]
                ):
                    self.script_inventory["javascript_scripts"].append({
                        "path": str(js_file),
                        "relative_path": str(js_file.relative_to(self.base_dir)),
                        "name": js_file.name,
                        "directory": str(js_file.parent.relative_to(self.base_dir)),
                        "size": js_file.stat().st_size,
                        "modified": datetime.fromtimestamp(js_file.stat().st_mtime).isoformat()
                    })

        # Find shell scripts
        for sh_file in self.base_dir.rglob("*.sh"):
            if not self.should_exclude_path(sh_file):
                self.script_inventory["shell_scripts"].append({
                    "path": str(sh_file),
                    "relative_path": str(sh_file.relative_to(self.base_dir)),
                    "name": sh_file.name,
                    "directory": str(sh_file.parent.relative_to(self.base_dir)),
                    "size": sh_file.stat().st_size,
                    "modified": datetime.fromtimestamp(sh_file.stat().st_mtime).isoformat(),
                    "executable": os.access(sh_file, os.X_OK)
                })

        # Log findings
        logger.info(f"📊 Found across entire project:")
        logger.info(f"  - Python scripts: {len(self.script_inventory['python_scripts'])}")
        logger.info(f"  - JavaScript scripts: {len(self.script_inventory['javascript_scripts'])}")
        logger.info(f"  - Shell scripts: {len(self.script_inventory['shell_scripts'])}")

        return self.script_inventory

    def categorize_script_by_location_and_content(self, script_info: Dict) -> str:
        """Categorize script based on location and content analysis"""
        path = script_info["relative_path"]
        name = script_info["name"]
        directory = script_info["directory"]

        # Already organized scripts
        if path.startswith("scripts/"):
            return "already_organized"

        # Frontend source code (not scripts)
        if "frontend/src/" in path:
            return "frontend_source_code"

        # Backend source code
        if "backend/src/" in path:
            return "backend_source_code"

        # Configuration files in root or specific dirs
        if name in ["production.config.js", "worker.js"] or "config" in name.lower():
            return "configuration"

        # Carmen transparencia system files
        if path.startswith("carmen_transparencia/") and not path.startswith("carmen_transparencia/scripts/"):
            if name in ["cli.py", "system.py", "__init__.py"]:
                return "carmen_system_core"
            elif "test" in name.lower() or "demo" in name.lower() or "example" in name.lower():
                return "carmen_system_utilities"
            else:
                return "carmen_system_modules"

        # Carmen transparencia scripts
        if path.startswith("carmen_transparencia/scripts/"):
            return "carmen_scripts"

        # Backend utilities
        if path.startswith("backend/") and name.endswith((".py", ".js", ".sh")):
            return "backend_utilities"

        # Frontend utilities
        if path.startswith("frontend/scripts/"):
            return "frontend_utilities"

        # Database scripts
        if "database" in directory or "db" in name.lower():
            return "database_scripts"

        # Root level scripts (scattered)
        if "/" not in directory:  # Root level
            return "root_scattered"

        # Service scripts
        if path.startswith("services/"):
            return "service_scripts"

        return "uncategorized"

    def organize_scripts(self):
        """Organize all scripts into proper locations"""
        logger.info("🗂️  Organizing scripts across entire project...")

        # Create organization directories
        org_dirs = {
            "carmen_scripts": self.scripts_dir / "carmen_transparencia",
            "backend_utilities": self.scripts_dir / "backend",
            "frontend_utilities": self.scripts_dir / "frontend",
            "database_scripts": self.scripts_dir / "database",
            "service_scripts": self.scripts_dir / "services",
            "configuration": self.scripts_dir / "config",
            "root_scattered": self.scripts_dir / "miscellaneous",
            "carmen_system_utilities": self.scripts_dir / "carmen_transparencia" / "utilities"
        }

        for org_dir in org_dirs.values():
            org_dir.mkdir(parents=True, exist_ok=True)

        # Organize all script types
        for script_type, scripts in self.script_inventory.items():
            if script_type == "scattered_scripts":
                continue

            for script_info in scripts:
                category = self.categorize_script_by_location_and_content(script_info)
                src_path = Path(script_info["path"])

                # Skip already organized or core source code
                if category in ["already_organized", "frontend_source_code", "backend_source_code", "carmen_system_core", "carmen_system_modules"]:
                    continue

                # Determine destination
                dest_dir = None
                if category in org_dirs:
                    dest_dir = org_dirs[category]
                elif category == "uncategorized":
                    dest_dir = self.scripts_dir / "miscellaneous"

                if dest_dir:
                    dest_path = dest_dir / src_path.name

                    # Avoid conflicts and duplicates
                    if dest_path.exists():
                        counter = 1
                        base_name = src_path.stem
                        extension = src_path.suffix
                        while dest_path.exists():
                            dest_path = dest_dir / f"{base_name}_{counter}{extension}"
                            counter += 1

                    try:
                        shutil.move(str(src_path), str(dest_path))
                        logger.info(f"  ✅ Moved {src_path.name} → {dest_dir.name}/")

                        # Record as scattered script that was moved
                        self.script_inventory["scattered_scripts"].append({
                            **script_info,
                            "category": category,
                            "new_location": str(dest_path.relative_to(self.base_dir)),
                            "action": "moved"
                        })
                    except Exception as e:
                        logger.error(f"  ❌ Failed to move {src_path.name}: {e}")

    def create_comprehensive_inventory(self):
        """Create comprehensive inventory and report"""
        inventory_file = self.scripts_dir / "comprehensive_script_inventory.json"

        # Compile comprehensive statistics
        summary = {
            "audit_date": datetime.now().isoformat(),
            "total_scripts_found": sum(len(scripts) for scripts in self.script_inventory.values() if isinstance(scripts, list)),
            "scripts_moved": len(self.script_inventory["scattered_scripts"]),
            "organization_summary": {},
            "detailed_inventory": self.script_inventory
        }

        # Count by category
        categories = {}
        for script_type, scripts in self.script_inventory.items():
            if isinstance(scripts, list):
                for script in scripts:
                    if "category" in script:
                        cat = script["category"]
                        categories[cat] = categories.get(cat, 0) + 1

        summary["organization_summary"] = categories

        with open(inventory_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)

        logger.info(f"📋 Comprehensive inventory saved to {inventory_file}")
        return summary

    def clean_empty_directories(self):
        """Clean up empty directories after moving scripts"""
        logger.info("🧹 Cleaning up empty directories...")

        dirs_to_check = [
            self.base_dir / "carmen_transparencia" / "scripts",
            self.base_dir / "frontend" / "scripts",
            self.base_dir / "services"
        ]

        for directory in dirs_to_check:
            if directory.exists() and directory.is_dir():
                try:
                    # Check if directory is empty
                    if not any(directory.iterdir()):
                        directory.rmdir()
                        logger.info(f"  🗑️  Removed empty directory: {directory.relative_to(self.base_dir)}")
                except Exception as e:
                    logger.warning(f"  ⚠️  Could not remove {directory}: {e}")

    def run_comprehensive_organization(self):
        """Run the complete script organization process"""
        logger.info("🚀 Starting comprehensive script organization...")

        # Find all scripts
        self.find_all_scripts()

        # Organize scripts
        self.organize_scripts()

        # Create inventory
        summary = self.create_comprehensive_inventory()

        # Clean up
        self.clean_empty_directories()

        # Print final report
        logger.info(f"\n📊 COMPREHENSIVE ORGANIZATION SUMMARY:")
        logger.info(f"  🔍 Total scripts found: {summary['total_scripts_found']}")
        logger.info(f"  📦 Scripts moved/organized: {summary['scripts_moved']}")

        if summary["organization_summary"]:
            logger.info(f"  📂 Organization by category:")
            for category, count in summary["organization_summary"].items():
                logger.info(f"    - {category.replace('_', ' ').title()}: {count}")

        # Show current script directory structure
        logger.info(f"\n📁 Organized scripts structure:")
        for item in sorted(self.scripts_dir.iterdir()):
            if item.is_dir():
                count = len(list(item.rglob("*"))) - len(list(item.rglob("*/")))
                logger.info(f"  📂 {item.name}/ ({count} files)")

        logger.info(f"\n✅ Comprehensive script organization complete!")
        logger.info(f"📁 All scripts organized in: {self.scripts_dir}")

def main():
    organizer = ComprehensiveScriptOrganizer()
    organizer.run_comprehensive_organization()

if __name__ == "__main__":
    main()