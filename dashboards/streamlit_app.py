"""
Streamlit dashboard for Carmen de Areco transparency data
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path
import numpy as np
import glob


def load_data():
    """Load transparency data from multiple directories"""
    data_dirs = [
        Path("data/processed"),
        Path("data/consolidated"), 
        Path("data/cleaned"),
        Path("../data/processed"),
        Path("../data/consolidated"),
        Path("frontend/public/data/csv")
    ]
    
    all_csv_files = []
    
    # Find CSV files in all data directories
    for data_dir in data_dirs:
        if data_dir.exists():
            csv_files = list(data_dir.rglob("*.csv"))
            all_csv_files.extend(csv_files)
    
    if all_csv_files:
        # Create a file selector for users to choose which CSV to load
        csv_names = [f.name for f in all_csv_files]
        csv_paths = [str(f) for f in all_csv_files]
        
        # Allow users to see the path info
        csv_options = [f"{name} (from: {str(Path(path).parent.name)})" for name, path in zip(csv_names, csv_paths)]
        selected_option = st.selectbox("Select a dataset to visualize:", csv_options)
        
        # Extract the actual path from the selected option
        selected_index = csv_options.index(selected_option)
        selected_path = all_csv_files[selected_index]
        
        try:
            df = pd.read_csv(selected_path)
            st.info(f"Loaded: {selected_path.name} from {selected_path.parent.name} ({df.shape[0]} rows, {df.shape[1]} columns)")
            return df
        except Exception as e:
            st.error(f"Error loading {selected_path.name}: {str(e)}")
            return pd.DataFrame()
    else:
        st.warning("No CSV data files found in any data directory")
        return pd.DataFrame()


def create_budget_execution_chart(df):
    """Create a budget execution visualization"""
    # Look for columns related to budget and execution
    budget_cols = [col for col in df.columns if 'budget' in col.lower() or 'presupuesto' in col.lower()]
    execution_cols = [col for col in df.columns if 'executed' in col.lower() or 'ejecutado' in col.lower() or 'execution' in col.lower()]
    
    if budget_cols and execution_cols:
        # Use the first matching columns
        budget_col = budget_cols[0]
        execution_col = execution_cols[0]
        
        # Look for a grouping column (like sector or year)
        grouping_cols = [col for col in df.columns if 'sector' in col.lower() or 'year' in col.lower() or 'anio' in col.lower()]
        grouping_col = grouping_cols[0] if grouping_cols else None
        
        if grouping_col:
            # Create a grouped bar chart
            fig = px.bar(df, 
                         x=grouping_col, 
                         y=[budget_col, execution_col], 
                         title=f"{budget_col} vs {execution_col} by {grouping_col}",
                         barmode='group')
        else:
            # Create a simple scatter plot if no grouping column
            fig = px.scatter(df, 
                             x=budget_col, 
                             y=execution_col,
                             title=f"{budget_col} vs {execution_col}",
                             trendline="ols")
        
        return fig
    return None


def create_time_series_chart(df):
    """Create a time series visualization"""
    # Look for date/time related columns
    date_cols = [col for col in df.columns if 'date' in col.lower() or 'year' in col.lower() or 'month' in col.lower() or 'anio' in col.lower() or 'quarter' in col.lower()]
    
    if date_cols:
        date_col = date_cols[0]
        
        # Look for value columns to plot over time
        value_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if value_cols and len(value_cols) > 0:
            # Option to select which value columns to plot
            selected_values = st.multiselect("Select value columns to plot over time:", value_cols, default=value_cols[:2])
            
            if selected_values:
                fig = px.line(df, x=date_col, y=selected_values, title=f"Time Series: {', '.join(selected_values)} over {date_col}")
                return fig
    return None


def create_indicator_visualization(df):
    """Create visualizations for indicators like 'Asistencias a vecinos' and 'cámaras de monitoreo'"""
    # Look for indicator-related columns
    indicator_cols = []
    for col in df.columns:
        if any(keyword in col.lower() for keyword in ['asistencias', 'vecinos', 'camaras', 'monitoreo', 'familias']):
            indicator_cols.append(col)
    
    if indicator_cols:
        # Create visualization for each indicator
        for indicator_col in indicator_cols:
            if indicator_col in df.columns:
                # Check if column is numeric
                if pd.api.types.is_numeric_dtype(df[indicator_col]):
                    st.subheader(f"Trend: {indicator_col}")
                    
                    # Look for time-related columns for time series
                    date_cols = [col for col in df.columns if 'date' in col.lower() or 'year' in col.lower() or 'month' in col.lower() or 'anio' in col.lower() or 'quarter' in col.lower()]
                    
                    if date_cols:
                        time_col = date_cols[0]
                        fig = px.line(df, x=time_col, y=indicator_col, title=f"{indicator_col} over {time_col}")
                        st.plotly_chart(fig, use_container_width=True)
                    else:
                        # If no date column, just show basic chart
                        fig = px.bar(df, x=df.index, y=indicator_col, title=f"{indicator_col}")
                        st.plotly_chart(fig, use_container_width=True)
        return True
    return False


def create_gender_staffing_visualization(df):
    """Create visualization for gender staffing data"""
    # Look for gender-related columns (months: ENE, FEB, MAR, etc.)
    month_cols = [col for col in df.columns if col.upper() in ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]]
    
    if month_cols:
        st.subheader("Gender Staffing Trend")
        
        # Melt the dataframe to have months as values
        gender_df = df[month_cols].melt(var_name='Month', value_name='Staff_Count')
        
        fig = px.line(gender_df, x='Month', y='Staff_Count', title="Gender Staffing by Month")
        st.plotly_chart(fig, use_container_width=True)
        return True
    return False


def create_dashboard_summary(df):
    """Create a summary dashboard of the dataset"""
    st.subheader("Dataset Summary")
    
    # Basic metrics
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Rows", df.shape[0])
    col2.metric("Total Columns", df.shape[1])
    col3.metric("Memory Usage", f"{df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
    
    # Count numeric vs categorical columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    col4.metric("Numeric Columns", len(numeric_cols))
    
    # Show basic stats
    if numeric_cols:
        st.subheader("Numeric Columns Statistics")
        st.write(df[numeric_cols].describe())
    
    # Show sample of data
    st.subheader("Data Preview")
    rows_to_show = st.slider("Number of rows to display", 5, min(100, len(df)), min(20, len(df)))
    st.dataframe(df.head(rows_to_show))


def main():
    st.set_page_config(page_title="Carmen de Areco - Transparency Dashboard", layout="wide")
    
    st.title("🏛️ Carmen de Areco - Transparency Portal Dashboard")
    st.markdown("*Comprehensive visualization of municipal financial and operational data*")
    
    # Sidebar for navigation and options
    st.sidebar.header("Dashboard Controls")
    page = st.sidebar.selectbox("Choose a view:", 
                               ["📊 Dataset Overview", "📈 Budget Analysis", "💰 Revenue & Expenditure", 
                                "🏛️ Sector Analysis", "📊 Indicator Analysis", "👥 Gender Staffing", 
                                "📈 Time Series", "📄 Raw Data Exploration"])
    
    # Load data
    df = load_data()
    
    if not df.empty:
        # Create tabs for different visualization types
        if page == "📊 Dataset Overview":
            create_dashboard_summary(df)
        
        elif page == "📈 Budget Analysis":
            st.header("📈 Budget Execution Analysis")
            
            fig_budget = create_budget_execution_chart(df)
            if fig_budget:
                st.plotly_chart(fig_budget, use_container_width=True)
            else:
                st.info("No budget vs execution columns found in this dataset. Expected columns with names containing 'budget'/'presupuesto' and 'executed'/'ejecutado'.")
        
        elif page == "💰 Revenue & Expenditure":
            st.header("💰 Revenue vs Expenditure Analysis")
            
            # Look for revenue and expenditure columns
            revenue_cols = [col for col in df.columns if 'revenue' in col.lower() or 'ingreso' in col.lower()]
            expenditure_cols = [col for col in df.columns if 'expenditure' in col.lower() or 'gasto' in col.lower() or 'expense' in col.lower()]
            
            if revenue_cols and expenditure_cols:
                # Create revenue vs expenditure visualization
                rev_col = revenue_cols[0]
                exp_col = expenditure_cols[0]
                
                fig = px.scatter(df, 
                                 x=rev_col, 
                                 y=exp_col,
                                 title=f"{rev_col} vs {exp_col}",
                                 trendline="ols")
                
                st.plotly_chart(fig, use_container_width=True)
                
                # Add balance calculation
                if rev_col in df.columns and exp_col in df.columns:
                    df = df.copy()  # Avoid SettingWithCopyWarning
                    df['balance'] = df[rev_col] - df[exp_col]
                    st.subheader("Balance (Revenue - Expenditure)")
                    st.line_chart(df.set_index(rev_col)['balance'])
            else:
                st.info("No revenue or expenditure columns found in this dataset. Expected columns with names containing 'revenue'/'ingreso' or 'expenditure'/'gasto'.")
        
        elif page == "🏛️ Sector Analysis":
            st.header("🏛️ Sector Analysis")
            
            # Look for sector-related columns
            sector_cols = [col for col in df.columns if 'sector' in col.lower() or 'area' in col.lower() or 'departamento' in col.lower()]
            
            if sector_cols:
                sector_col = sector_cols[0]
                st.subheader(f"Analysis by {sector_col}")
                
                # Show sector distribution
                sector_counts = df[sector_col].value_counts()
                fig_sector = px.pie(values=sector_counts.values, names=sector_counts.index, title=f"Distribution by {sector_col}")
                st.plotly_chart(fig_sector, use_container_width=True)
                
                # If there are numeric columns, show them by sector
                numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
                if numeric_cols:
                    selected_metric = st.selectbox("Select metric to analyze by sector:", numeric_cols)
                    if selected_metric and selected_metric in df.columns:
                        fig_bar = px.bar(df, 
                                         x=sector_col, 
                                         y=selected_metric, 
                                         title=f"{selected_metric} by {sector_col}")
                        st.plotly_chart(fig_bar, use_container_width=True)
            else:
                st.info("No sector-related columns found. Expected columns with names containing 'sector', 'area', or 'departamento'.")
                
                # If no sector column, still allow analysis of numeric columns
                numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
                if numeric_cols:
                    st.subheader("Numeric Columns Overview")
                    selected_cols = st.multiselect("Select columns to visualize:", numeric_cols, default=numeric_cols[:3])
                    if selected_cols:
                        for col in selected_cols:
                            if col in df.columns:
                                st.subheader(f"Distribution of {col}")
                                st.bar_chart(df[col].value_counts().sort_index())
        
        elif page == "📊 Indicator Analysis":
            st.header("📊 Indicator Analysis")
            if not create_indicator_visualization(df):
                st.info("No indicator columns found. Expected columns with keywords like 'asistencias', 'vecinos', 'camaras', 'monitoreo', 'familias'.")
        
        elif page == "👥 Gender Staffing":
            st.header("👥 Gender Staffing Analysis")
            if not create_gender_staffing_visualization(df):
                st.info("No gender staffing data found. Expected columns for months like 'ENE', 'FEB', 'MAR', etc.")
        
        elif page == "📈 Time Series":
            st.header("📈 Time Series Analysis")
            fig_time = create_time_series_chart(df)
            if fig_time:
                st.plotly_chart(fig_time, use_container_width=True)
            else:
                st.info("No time series data found. Expected date/year/month columns with numeric values to plot over time.")
        
        elif page == "📄 Raw Data Exploration":
            st.header("📄 Raw Data Exploration")
            
            st.subheader("Data Preview")
            rows_to_show = st.slider("Number of rows to display", 5, min(100, len(df)), min(20, len(df)))
            st.dataframe(df.head(rows_to_show))
            
            st.subheader("Column Information")
            col_info = pd.DataFrame({
                'Column': df.columns,
                'Type': df.dtypes,
                'Non-Null Count': df.count(),
                'Null Count': df.isnull().sum(),
                'Unique Values': [df[col].nunique() for col in df.columns]
            })
            st.dataframe(col_info)
            
            st.subheader("Column Filtering")
            selected_columns = st.multiselect("Select columns to display:", df.columns.tolist(), default=df.columns.tolist()[:5])
            if selected_columns:
                st.dataframe(df[selected_columns].head(20))
    
    else:
        st.error("No data available to display. Please ensure there are CSV files in the data directories: data/processed, data/consolidated, data/cleaned, or frontend/public/data/csv/")


if __name__ == "__main__":
    main()