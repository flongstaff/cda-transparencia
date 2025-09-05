#!/usr/bin/env python3
"""
Live Data API - Carmen de Areco Transparency Portal
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from scripts.scraping.live_scrape import LiveScraper
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/data/live')
def get_live_data():
    try:
        scraper = LiveScraper()
        documents = []
        
        for url, local_path in scraper.scrape_all():
            documents.append({
                'url': url,
                'filename': local_path.name if local_path else None,
                'size': local_path.stat().st_size if local_path and local_path.exists() else 0
            })
        
        return jsonify({
            "source": "live_portal",
            "timestamp": datetime.now().isoformat(),
            "total_documents": len(documents),
            "documents": documents
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/data/report')
def get_report():
    try:
        # Return basic project status
        return jsonify({
            "report_generated": datetime.now().isoformat(),
            "project": "Carmen de Areco Transparency Portal",
            "status": "active",
            "features": [
                "Live document scraping",
                "REST API access",
                "Static dashboard",
                "Data comparison"
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Carmen de Areco Transparency API")
    print("📚 Available endpoints:")
    print("   GET /health - Health check") 
    print("   GET /data/live - Live portal data")
    print("   GET /data/report - Project status")
    
    app.run(host='0.0.0.0', port=5555, debug=True)