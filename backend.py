from flask import Flask, jsonify

app = Flask(__name__)

# Sample data to return
sample_data = [
    {
        "id": 1,
        "name": "Project Alpha",
        "status": "completed",
        "progress": 100,
        "budget": 50000,
        "spent": 48000
    },
    {
        "id": 2,
        "name": "Project Beta",
        "status": "in_progress",
        "progress": 75,
        "budget": 30000,
        "spent": 22500
    },
    {
        "id": 3,
        "name": "Project Gamma",
        "status": "pending",
        "progress": 0,
        "budget": 25000,
        "spent": 0
    }
]

@app.route('/api/projects', methods=['GET'])
def get_projects():
    return jsonify(sample_data)

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    # Return comprehensive dashboard data
    return jsonify({
        "projects": sample_data,
        "stats": {
            "total_projects": len(sample_data),
            "completed_projects": sum(1 for p in sample_data if p["status"] == "completed"),
            "in_progress_projects": sum(1 for p in sample_data if p["status"] == "in_progress"),
            "pending_projects": sum(1 for p in sample_data if p["status"] == "pending"),
            "total_budget": sum(p["budget"] for p in sample_data),
            "total_spent": sum(p["spent"] for p in sample_data),
            "budget_utilization_rate": round(sum(p["spent"] for p in sample_data) / sum(p["budget"] for p in sample_data) * 100, 2)
        },
        "budget_distribution": [
            {"category": "Personal", "amount": 2150670000},
            {"category": "Corrientes", "amount": 1250000000},
            {"category": "Capital", "amount": 875000000},
            {"category": "Deuda", "amount": 375000000},
            {"category": "Transferencias", "amount": 350000000}
        ]
    })

@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project_by_id(project_id):
    project = next((p for p in sample_data if p["id"] == project_id), None)
    if project:
        return jsonify(project)
    else:
        return jsonify({"error": "Project not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3002)
