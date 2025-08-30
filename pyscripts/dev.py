
import subprocess
import click

@click.group()
def cli():
    pass

@cli.command()
def frontend():
    click.echo("🌐 Starting frontend development server...")
    subprocess.run("npm run dev", shell=True, cwd="frontend")

@cli.command()
def backend():
    click.echo("⚙️ Starting backend API server...")
    subprocess.run("npm start", shell=True, cwd="backend")

@cli.command()
def scraper():
    click.echo("🔍 Running data scraper...")
    subprocess.run("python src/live_scrape.py", shell=True)

@cli.command()
def build():
    click.echo("🏗️ Building frontend for production...")
    subprocess.run("npx vite build", shell=True, cwd="frontend")

@cli.command()
def test():
    click.echo("✅ Testing frontend build...")
    result = subprocess.run("npx vite build", shell=True, cwd="frontend")
    if result.returncode == 0:
        click.echo("✅ Frontend build successful")
    else:
        click.echo("❌ Frontend build failed")

if __name__ == '__main__':
    cli()
