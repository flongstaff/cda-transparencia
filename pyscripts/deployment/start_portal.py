
import subprocess
import click
import time
import psutil
import os

class Bcolors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    NC = '\033[0m'

def print_success(message):
    click.echo(f"{Bcolors.GREEN}✅ {message}{Bcolors.NC}")

def print_error(message):
    click.echo(f"{Bcolors.RED}❌ {message}{Bcolors.NC}")

@click.command()
def start_portal():
    click.echo("🚀 Starting Carmen de Areco Transparency Portal")
    click.echo("==============================================")

    backend_pid = None
    frontend_pid = None

    def cleanup():
        click.echo("")
        click.echo("🛑 Shutting down servers...")
        if backend_pid:
            try:
                parent = psutil.Process(backend_pid)
                for child in parent.children(recursive=True):
                    child.kill()
                parent.kill()
                print_success("Backend server stopped")
            except psutil.NoSuchProcess:
                pass
        if frontend_pid:
            try:
                parent = psutil.Process(frontend_pid)
                for child in parent.children(recursive=True):
                    child.kill()
                parent.kill()
                print_success("Frontend server stopped")
            except psutil.NoSuchProcess:
                pass
        raise SystemExit(0)

    import signal
    signal.signal(signal.SIGINT, lambda s, f: cleanup())
    signal.signal(signal.SIGTERM, lambda s, f: cleanup())

    click.echo("🔧 Starting backend server...")
    backend_process = subprocess.Popen("npm start", shell=True, cwd="backend", stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    backend_pid = backend_process.pid
    time.sleep(3)

    if backend_process.poll() is None:
        print_success(f"Backend server started (PID: {backend_pid})")
    else:
        print_error("Backend server failed to start")
        raise SystemExit(1)

    click.echo("🖥️  Starting frontend server...")
    frontend_process = subprocess.Popen("npm run dev", shell=True, cwd="frontend", stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    frontend_pid = frontend_process.pid
    time.sleep(5)

    if frontend_process.poll() is None:
        print_success(f"Frontend server started (PID: {frontend_pid})")
    else:
        print_error("Frontend server failed to start")
        raise SystemExit(1)

    click.echo("")
    click.echo("🎉 Servers are running!")
    click.echo("   Backend:  http://localhost:3001")
    click.echo("   Frontend: http://localhost:5173")
    click.echo("   Power BI Analysis: http://localhost:5173/financial-analysis")
    click.echo("")
    click.echo("Press Ctrl+C to stop all servers")

    while True:
        if backend_process.poll() is not None:
            print_error("❌ Backend server stopped unexpectedly")
            cleanup()
        if frontend_process.poll() is not None:
            print_error("❌ Frontend server stopped unexpectedly")
            cleanup()
        time.sleep(1)

if __name__ == '__main__':
    start_portal()
