# tests/test_cli.py
import click
import pytest
from carmen_transparencia import cli

def test_cli_exists():
    """Test that the CLI object exists"""
    assert cli is not None

# def test_live_command():
#     runner = click.testing.CliRunner()
#     result = runner.invoke(cli, ["live", "--output", "tmp"])
#     assert result.exit_code == 0
#     assert "Downloading" in result.output