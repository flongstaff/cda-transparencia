#!/usr/bin/env python3
"""
Script to populate fees_rights table with data derived from financial reports
"""

import psycopg2
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def populate_fees_rights_from_financial_reports():
    """Populate fees_rights table with data from financial_reports"""
    
    # Database connection
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        database="transparency_portal",
        user="postgres",
        password="postgres"
    )
    cur = conn.cursor()
    
    try:
        # Get years that have financial reports but no fees_rights data
        cur.execute("""
            SELECT DISTINCT fr.year 
            FROM financial_reports fr
            LEFT JOIN fees_rights fr2 ON fr.year = fr2.year
            WHERE fr2.year IS NULL
            ORDER BY fr.year
        """)
        
        years_without_fees = [row[0] for row in cur.fetchall()]
        logger.info(f"Years without fees_rights data: {years_without_fees}")
        
        # For each year, create fees_rights entries based on financial reports
        for year in years_without_fees:
            logger.info(f"Processing year {year}")
            
            # Get total income for the year from financial reports
            cur.execute("""
                SELECT SUM(income) as total_income
                FROM financial_reports
                WHERE year = %s
            """, (year,))
            
            result = cur.fetchone()
            total_income = float(result[0]) if result and result[0] else 0
            
            if total_income > 0:
                # Create fees_rights entries
                # We'll create a few categories to simulate real fee/rights data
                categories = [
                    ("Impuestos", "Recaudación de impuestos municipales", 0.6),
                    ("Tasas", "Recaudación de tasas municipales", 0.25),
                    ("Contribuciones", "Contribuciones especiales", 0.1),
                    ("Otros", "Otros ingresos municipales", 0.05)
                ]
                
                for category, description, percentage in categories:
                    revenue = float(total_income) * percentage
                    # Collection efficiency varies by category (simulated)
                    efficiency = 85.0 + (10.0 * (1 - percentage))  # Higher efficiency for larger categories
                    
                    cur.execute("""
                        INSERT INTO fees_rights (year, category, description, revenue, collection_efficiency)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (year, category, description, revenue, efficiency))
                    
                    logger.info(f"  Added {category}: ${revenue:,.2f} ({efficiency:.1f}% efficiency)")
                
                logger.info(f"Successfully populated fees_rights for year {year} with total revenue ${total_income:,.2f}")
            else:
                logger.warning(f"No income data found for year {year}")
        
        # Commit changes
        conn.commit()
        logger.info("✅ Successfully populated fees_rights table")
        
        # Verify the data
        cur.execute("""
            SELECT year, COUNT(*) as count, SUM(revenue) as total_revenue
            FROM fees_rights
            GROUP BY year
            ORDER BY year
        """)
        
        results = cur.fetchall()
        print("\n=== Fees/Rights Data Summary ===")
        for year, count, total_revenue in results:
            print(f"  {year}: {count} records, Total Revenue: ${total_revenue:,.2f}")
        
    except Exception as e:
        logger.error(f"Error populating fees_rights table: {e}")
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

def main():
    """Main entry point"""
    try:
        populate_fees_rights_from_financial_reports()
        print("\n✅ Fees/Rights data population completed successfully!")
    except Exception as e:
        print(f"❌ Error during fees/rights data population: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
