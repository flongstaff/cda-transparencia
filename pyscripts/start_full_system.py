
import subprocess
import click
import time
import psutil
import os

class Bcolors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    PURPLE = '\033[0;35m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'

def print_status(message):
    click.echo(f"{Bcolors.BLUE}[{time.strftime('%H:%M:%S')}] {message}{Bcolors.NC}")

def print_success(message):
    click.echo(f"{Bcolors.GREEN}[{time.strftime('%H:%M:%S')}] {message}{Bcolors.NC}")

def print_warning(message):
    click.echo(f"{Bcolors.YELLOW}[{time.strftime('%H:%M:%S')}] {message}{Bcolors.NC}")

def print_error(message):
    click.echo(f"{Bcolors.RED}[{time.strftime('%H:%M:%S')}] {message}{Bcolors.NC}")

def print_header(message):
    click.echo(f"{Bcolors.PURPLE}{message}{Bcolors.NC}")

@click.command()
def start_full_system():
    click.echo("🚀 Starting Complete Carmen de Areco Transparency Portal")
    click.echo("=======================================================")

    backend_pid = None
    frontend_pid = None

    def cleanup():
        click.echo("")
        print_status("Shutting down servers...")
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

    if not os.path.isdir("backend") or not os.path.isdir("frontend"):
        print_error("Error: Could not find backend or frontend directories")
        print_error("Please run this script from the project root directory")
        raise SystemExit(1)

    print_status("Checking system requirements...")
    # ... (rest of the checks)

    print_status("Starting backend server...")
    backend_process = subprocess.Popen("npm start", shell=True, cwd="backend", stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    backend_pid = backend_process.pid
    time.sleep(3)

    if backend_process.poll() is None:
        print_success(f"Backend server started successfully (PID: {backend_pid})")
    else:
        print_error("Backend server failed to start")
        raise SystemExit(1)

    print_status("Starting frontend development server...")
    frontend_process = subprocess.Popen("npm run dev", shell=True, cwd="frontend", stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    frontend_pid = frontend_process.pid
    time.sleep(5)

    if frontend_process.poll() is None:
        print_success(f"Frontend server started successfully (PID: {frontend_pid})")
    else:
        print_error("Frontend server failed to start")
        raise SystemExit(1)

    time.sleep(3)

    print_success("🎉 All servers are running!")
    print_header("📱 Access the portal at:")
    click.echo("   Main Portal:      http://localhost:5173")
    click.echo("   Financial Analysis: http://localhost:5173/financial-analysis")
    click.echo("   Power BI Data:    http://localhost:5173/powerbi-data")
    click.echo("   API Documentation: http://localhost:3000/api-docs")
    print_header("💾 Data Location:")
    click.echo(f"   Power BI Data: {os.getcwd()}/data/powerbi_extraction/")
    print_header("🛑 To stop all servers, press Ctrl+C")

    while True:
        if backend_process.poll() is not None:
            print_error("❌ Backend server stopped unexpectedly")
            cleanup()
        if frontend_process.poll() is not None:
            print_error("❌ Frontend server stopped unexpectedly")
            cleanup()
        print_status(f"Servers are running (Backend PID: {backend_pid}, Frontend PID: {frontend_pid})")
        time.sleep(30)

if __name__ == '__main__':
    start_full_system()
