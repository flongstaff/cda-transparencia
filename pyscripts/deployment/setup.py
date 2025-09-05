
import subprocess
import click
import os

@click.command()
def setup():
    click.echo("🚀 Setting up Carmen de Areco Transparency Portal Development Environment")

    if not os.path.exists("README.md"):
        click.echo("❌ Please run this script from the root of the repository")
        raise SystemExit(1)

    click.echo("📦 Installing dependencies...")

    if os.path.isdir("frontend"):
        click.echo("Installing frontend dependencies...")
        subprocess.run("npm install", shell=True, cwd="frontend")

    if os.path.isdir("backend"):
        click.echo("Installing backend dependencies...")
        subprocess.run("npm install", shell=True, cwd="backend")

    if os.path.exists("requirements.txt"):
        click.echo("Installing Python dependencies...")
        subprocess.run("pip install -r requirements.txt", shell=True)

    if os.path.exists("requirements-dev.txt"):
        click.echo("Installing development dependencies...")
        subprocess.run("pip install -r requirements-dev.txt", shell=True)

    if os.path.isdir("backend") and os.path.exists("backend/docker-compose.yml"):
        click.echo("Starting database with Docker...")
        subprocess.run("docker-compose up -d", shell=True, cwd="backend")

    click.echo("✅ Setup complete!")
    click.echo("")
    click.echo("You can now start developing:")
    click.echo("  python pyscripts/dev.py frontend    # Start frontend development server")
    click.echo("  python pyscripts/dev.py backend     # Start backend API server")
    click.echo("  python pyscripts/dev.py scraper     # Run data scraper")

if __name__ == '__main__':
    setup()
