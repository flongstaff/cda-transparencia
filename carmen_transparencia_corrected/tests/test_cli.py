# tests/test_cli.py
"""Tests for the Carmen de Areco transparency scraper CLI."""

import pytest
import tempfile
import pathlib
import json
from click.testing import CliRunner
from carmen_transparencia_corrected.src.cli import cli

class TestCLI:
    """Test suite for the CLI commands."""
    
    def setup_method(self):
        """Setup test environment."""
        self.runner = CliRunner()
    
    def test_main_help(self):
        """Test that main CLI shows help."""
        result = self.runner.invoke(cli, ['--help'])
        assert result.exit_code == 0
        assert 'Carmen de Areco Transparency' in result.output
    
    def test_scrape_help(self):
        """Test scrape subcommand help."""
        result = self.runner.invoke(cli, ['scrape', '--help'])
        assert result.exit_code == 0
        assert 'Scrape documents' in result.output
    
    def test_process_help(self):
        """Test process subcommand help."""
        result = self.runner.invoke(cli, ['process', '--help'])
        assert result.exit_code == 0
        assert 'Process downloaded documents' in result.output
    
    def test_validate_nonexistent_directory(self):
        """Test validate command with nonexistent directory."""
        result = self.runner.invoke(cli, ['validate', '/nonexistent/directory'])
        assert result.exit_code != 0
    
    def test_validate_empty_directory(self):
        """Test validate command with empty directory."""
        with tempfile.TemporaryDirectory() as tmpdir:
            result = self.runner.invoke(cli, ['validate', tmpdir])
            assert result.exit_code == 0
            assert 'Valid: 0/0' in result.output
    
    @pytest.mark.skip(reason="Requires network access")
    def test_scrape_live_dry_run(self):
        """Test live scraping (skipped in normal test runs)."""
        with tempfile.TemporaryDirectory() as tmpdir:
            result = self.runner.invoke(cli, [
                'scrape', 'live', 
                '--output', tmpdir,
                '--depth', '1'
            ])
            # Note: This would require actual network access
            # In a real test environment, you'd mock the requests
    
    def test_process_empty_directory(self):
        """Test processing an empty directory."""
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = pathlib.Path(tmpdir)
            output_file = tmpdir_path / 'output.json'
            
            result = self.runner.invoke(cli, [
                'process', 'documents',
                str(tmpdir_path),
                str(output_file)
            ])
            
            assert result.exit_code == 0
            assert output_file.exists()
            
            # Check output file content
            with open(output_file, 'r') as f:
                data = json.load(f)
            
            assert data['total_files'] == 0
            assert data['processed_successfully'] == 0
    
    def test_process_with_test_files(self):
        """Test processing with some test files."""
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = pathlib.Path(tmpdir)
            
            # Create a dummy text file
            test_file = tmpdir_path / 'test.txt'
            test_file.write_text('Test content', encoding='utf-8')
            
            output_file = tmpdir_path / 'output.json'
            
            result = self.runner.invoke(cli, [
                'process', 'documents',
                str(tmpdir_path),
                str(output_file)
            ])
            
            assert result.exit_code == 0
            assert output_file.exists()
            
            # Check output
            with open(output_file, 'r') as f:
                data = json.load(f)
            
            assert data['total_files'] == 1
    
    def test_populate_help(self):
        """Test populate subcommand help."""
        result = self.runner.invoke(cli, ['populate', '--help'])
        assert result.exit_code == 0
        assert 'Populate SQLite database' in result.output

# Integration tests (require more setup)
class TestIntegration:
    """Integration tests for the full workflow."""
    
    @pytest.mark.integration
    def test_full_workflow(self):
        """Test the complete scrape -> process -> populate workflow."""
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = pathlib.Path(tmpdir)
            
            # This would be a complete end-to-end test
            # but requires careful mocking of network requests
            # and database setup
            pass

if __name__ == '__main__':
    pytest.main([__file__])