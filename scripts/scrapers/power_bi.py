#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager

# Initialize WebDriver (Chrome in this case)
driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()))

# Navigate to the Power BI report URL
power_bi_url = "https://app.powerbi.com/view?r=eyJrIjoiYzhjNWNhNmItOWY5Zi00OWExLTliMzAtMjYxZTM0NjM1Y2Y2IiwidCI6Ijk3MDQwMmVmLWNhZGMtNDcyOC05MjI2LTk3ZGRlODY4ZDg2ZCIsImMiOjR9&pageName=ReportSection"
driver.get(power_bi_url)

# Wait for the page to load
time.sleep(5)  # Adjust the sleep time as needed

# Example: Interacting with slicers or filters
# Note: You need to inspect the Power BI report to find the correct elements and their IDs or classes
# For example, if there's a slicer with ID 'slicer-id':
try:
    slicer = driver.find_element(By.ID, "slicer-id")
    # Perform actions on the slicer
except Exception as e:
    print(f"Error finding slicer: {e}")

# Example: Extracting data from the report
# Note: You need to inspect the Power BI report to find the correct elements and their IDs or classes
# For example, if data is within a table with ID 'table-id':
try:
    table = driver.find_element(By.ID, "table-id")
    rows = table.find_elements(By.TAG_NAME, "tr")

    data = []
    for row in rows:
        cols = row.find_elements(By.TAG_NAME, "td")
        cols_text = [col.text for col in cols]
        data.append(cols_text)

    # Print or save the extracted data
    for row in data:
        print(row)
except Exception as e:
    print(f"Error extracting data: {e}")

# Close the browser
driver.quit()
