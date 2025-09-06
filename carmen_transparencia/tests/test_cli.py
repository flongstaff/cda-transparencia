# tests/test_cli.py
import click
import pytest
from click.testing import CliRunner
from unittest.mock import patch, MagicMock
from carmen_transparencia import cli

def test_cli_exists():
    """Test that the CLI object exists"""
    assert cli is not None

@patch('carmen_transparencia.cli.IntegratedTransparencySystem')
def test_run_analysis_command(MockIntegratedSystem):
    """Test the run-analysis command with a mocked system."""
    # Arrange
    mock_instance = MockIntegratedSystem.return_value
    mock_instance.run_comprehensive_analysis.return_value = {
        'overall_risk_level': 'medium',
        'corruption_cases_tracked': 4,
        'recommendations': ['Test recommendation']
    }
    mock_instance.generate_transparency_report.return_value = "Test Report"
    
    runner = CliRunner()
    
    # Act
    result = runner.invoke(cli, ["run-analysis"])
    
    # Assert
    assert result.exit_code == 0
    assert "🚀 Starting comprehensive transparency analysis..." in result.output
    assert "📊 ANALYSIS COMPLETED" in result.output
    assert "Risk Level: MEDIUM" in result.output
    assert "Report generated:" in result.output
    
    # Verify that the methods were called
    MockIntegratedSystem.assert_called_once()
    mock_instance.run_comprehensive_analysis.assert_called_once()
    mock_instance.generate_transparency_report.assert_called_once()

# def test_live_command():
#     runner = click.testing.CliRunner()
#     result = runner.invoke(cli, ["live", "--output", "tmp"])
#     assert result.exit_code == 0
#     assert "Downloading" in result.output
