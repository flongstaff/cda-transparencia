"""
MCP Synchronization Utilities for Frontend and Backend
Ensures consistency between frontend and backend data processing
"""
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

class MCPSyncManager:
    """Manages synchronization between frontend and backend with MCP context"""
    
    def __init__(self, config_path: str = "system_config.json"):
        self.config_path = Path(config_path)
        self.sync_cache = Path("data/cache/mcp_sync.json")
        self.sync_cache.parent.mkdir(exist_ok=True)
        
        # Load configuration
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load system configuration"""
        default_config = {
            "version": "1.0",
            "sync_enabled": True,
            "cache_duration": 300,  # 5 minutes
            "mcp_context": {
                "source": "Carmen de Areco Transparency Portal",
                "context_id": "mcp-sync-v1"
            }
        }
        
        if self.config_path.exists():
            with open(self.config_path, 'r') as f:
                return {**default_config, **json.load(f)}
        return default_config
    
    def generate_sync_context(self, component_type: str, version: str) -> Dict[str, Any]:
        """Generate MCP context for synchronization"""
        return {
            "version": version,
            "timestamp": datetime.now().isoformat(),
            "component_type": component_type,
            "context_id": f"{component_type}-{datetime.now().timestamp()}",
            "sync_version": self.config.get("version", "1.0"),
            "source": self.config["mcp_context"]["source"]
        }
    
    def validate_sync_context(self, context: Dict[str, Any]) -> bool:
        """Validate that synchronization context is valid"""
        required_fields = ["version", "timestamp", "component_type", "context_id"]
        return all(field in context for field in required_fields)
    
    def update_sync_cache(self, key: str, data: Dict[str, Any]):
        """Update synchronization cache with MCP context"""
        cache_data = {}
        
        # Load existing cache
        if self.sync_cache.exists():
            with open(self.sync_cache, 'r') as f:
                cache_data = json.load(f)
        
        # Add MCP context to data
        mcp_context = self.generate_sync_context("cache_update", "1.0")
        
        cache_data[key] = {
            "data": data,
            "context": mcp_context,
            "updated_at": datetime.now().isoformat()
        }
        
        # Save cache
        with open(self.sync_cache, 'w') as f:
            json.dump(cache_data, f, indent=2)
    
    def get_sync_cache(self, key: str) -> Optional[Dict[str, Any]]:
        """Get cached data with MCP context"""
        if not self.sync_cache.exists():
            return None
            
        with open(self.sync_cache, 'r') as f:
            cache_data = json.load(f)
            
        if key in cache_data:
            # Check if cache is still valid
            item = cache_data[key]
            updated_time = datetime.fromisoformat(item["updated_at"])
            current_time = datetime.now()
            
            if (current_time - updated_time).seconds < self.config.get("cache_duration", 300):
                return item
                
        return None
    
    def get_frontend_backend_sync_status(self) -> Dict[str, Any]:
        """Get synchronization status between frontend and backend"""
        return {
            "sync_enabled": self.config.get("sync_enabled", True),
            "current_version": self.config.get("version", "1.0"),
            "mcp_context": self.config["mcp_context"],
            "cache_status": {
                "cache_file_exists": self.sync_cache.exists(),
                "cache_size": self.sync_cache.stat().st_size if self.sync_cache.exists() else 0
            },
            "last_sync": datetime.now().isoformat(),
            "status": "synced" if self.config.get("sync_enabled", True) else "disabled"
        }
    
    def create_sync_manifest(self, components: list) -> Dict[str, Any]:
        """Create a manifest of synchronized components"""
        return {
            "manifest_version": "1.0",
            "generated_at": datetime.now().isoformat(),
            "components": components,
            "mcp_context": self.generate_sync_context("manifest", "1.0"),
            "total_components": len(components)
        }

# Example usage
if __name__ == "__main__":
    # Initialize sync manager
    sync_manager = MCPSyncManager()
    
    # Generate context for a component
    context = sync_manager.generate_sync_context("budget_chart", "1.0")
    print("Generated MCP Context:", json.dumps(context, indent=2))
    
    # Test sync status
    status = sync_manager.get_frontend_backend_sync_status()
    print("\nSync Status:", json.dumps(status, indent=2))
    
    # Create sync manifest
    components = ["Budget_Execution", "Debt_Report", "Revenue_Report"]
    manifest = sync_manager.create_sync_manifest(components)
    print("\nSync Manifest:", json.dumps(manifest, indent=2))