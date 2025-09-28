#!/usr/bin/env python3
"""
Generate simple HTML charts from processed data
"""

import csv
import os

def generate_2019_chart():
    """Generate HTML chart for 2019 budget execution"""
    try:
        # Read 2019 data
        with open("data/processed/budget_execution_2019.csv", "r") as infile:
            reader = csv.reader(infile)
            rows = list(reader)
            
        if len(rows) < 2:
            print("⚠️ Insufficient data for 2019 chart")
            return
            
        # Create simple HTML table as a placeholder for the chart
        html = """
        <table border="1" style="width:100%; border-collapse: collapse;">
          <tr>
            <th>Sector</th>
            <th>Presupuestado (ARS)</th>
            <th>Ejecutado (ARS)</th>
          </tr>
        """
        
        for row in rows[1:]:  # Skip header
            if len(row) >= 3:
                html += f"""
                <tr>
                  <td>{row[0]}</td>
                  <td style="text-align:right;">{row[1]}</td>
                  <td style="text-align:right;">{row[2]}</td>
                </tr>
                """
                
        html += """
        </table>
        """
        
        # Write HTML file
        os.makedirs("public/charts", exist_ok=True)
        with open("public/charts/budget_2019.html", "w") as outfile:
            outfile.write(html)
            
        print("✅ Generated 2019 budget execution chart")
        
    except FileNotFoundError:
        print("⚠️ 2019 data file not found")
    except Exception as e:
        print(f"⚠️ Error generating 2019 chart: {e}")

def generate_2021_chart():
    """Generate HTML chart for 2021 quarterly execution"""
    try:
        # Read 2021 data
        with open("data/processed/budget_execution_2021.csv", "r") as infile:
            reader = csv.reader(infile)
            rows = list(reader)
            
        if len(rows) < 2:
            print("⚠️ Insufficient data for 2021 chart")
            return
            
        # Create simple HTML table as a placeholder for the chart
        html = """
        <table border="1" style="width:100%; border-collapse: collapse;">
          <tr>
            <th>Trimestre</th>
            <th>Presupuestado (ARS)</th>
            <th>Ejecutado (ARS)</th>
            <th>Porcentaje (%)</th>
          </tr>
        """
        
        for row in rows[1:]:  # Skip header
            if len(row) >= 4 and row[0] != "Total":
                html += f"""
                <tr>
                  <td>{row[0]}</td>
                  <td style="text-align:right;">{row[1]}</td>
                  <td style="text-align:right;">{row[2]}</td>
                  <td style="text-align:right;">{row[3]}%</td>
                </tr>
                """
                
        html += """
        </table>
        """
        
        # Write HTML file
        os.makedirs("public/charts", exist_ok=True)
        with open("public/charts/budget_2021_quarterly.html", "w") as outfile:
            outfile.write(html)
            
        print("✅ Generated 2021 quarterly execution chart")
        
    except FileNotFoundError:
        print("⚠️ 2021 data file not found")
    except Exception as e:
        print(f"⚠️ Error generating 2021 chart: {e}")

def generate_cameras_chart():
    """Generate HTML chart for security cameras"""
    try:
        # Read indicators data
        with open("data/processed/programmatic_indicators.csv", "r") as infile:
            reader = csv.DictReader(infile)
            rows = [row for row in reader if row["indicator"] == "security_cameras"]
            
        if not rows:
            print("⚠️ No security cameras data found")
            return
            
        # Create simple HTML table as a placeholder for the chart
        html = """
        <table border="1" style="width:100%; border-collapse: collapse;">
          <tr>
            <th>Archivo Fuente</th>
            <th>Planificado</th>
            <th>Ejecutado</th>
          </tr>
        """
        
        for row in rows:
            html += f"""
            <tr>
              <td>{row['source_file'][:30]}...</td>
              <td style="text-align:right;">{row['planned']}</td>
              <td style="text-align:right;">{row['executed']}</td>
            </tr>
            """
                
        html += """
        </table>
        <p><strong>Insight:</strong> En Q4 2023, 298 cámaras fueron instaladas vs 198 planificadas → 150% de ejecución</p>
        """
        
        # Write HTML file
        os.makedirs("public/charts", exist_ok=True)
        with open("public/charts/cameras_timeline.html", "w") as outfile:
            outfile.write(html)
            
        print("✅ Generated security cameras chart")
        
    except FileNotFoundError:
        print("⚠️ Indicators data file not found")
    except Exception as e:
        print(f"⚠️ Error generating cameras chart: {e}")

def generate_families_chart():
    """Generate HTML chart for families assisted"""
    try:
        # Read indicators data
        with open("data/processed/programmatic_indicators.csv", "r") as infile:
            reader = csv.DictReader(infile)
            rows = [row for row in reader if row["indicator"] == "families_assisted"]
            
        if not rows:
            print("⚠️ No families assisted data found")
            return
            
        # Create simple HTML table as a placeholder for the chart
        html = """
        <table border="1" style="width:100%; border-collapse: collapse;">
          <tr>
            <th>Archivo Fuente</th>
            <th>Familias Asistidas</th>
          </tr>
        """
        
        for row in rows:
            html += f"""
            <tr>
              <td>{row['source_file'][:30]}...</td>
              <td style="text-align:right;">{row['executed']}</td>
            </tr>
            """
                
        html += """
        </table>
        """
        
        # Write HTML file
        os.makedirs("public/charts", exist_ok=True)
        with open("public/charts/families_assisted.html", "w") as outfile:
            outfile.write(html)
            
        print("✅ Generated families assisted chart")
        
    except FileNotFoundError:
        print("⚠️ Indicators data file not found")
    except Exception as e:
        print(f"⚠️ Error generating families chart: {e}")

if __name__ == "__main__":
    generate_2019_chart()
    generate_2021_chart()
    generate_cameras_chart()
    generate_families_chart()