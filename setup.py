from setuptools import setup, find_packages

setup(
    name="carmen-transparency",
    version="1.0.0",
    description="Transparency data processing tools for Carmen de Areco",
    author="Franco Longstaff",
    author_email="franco.longstaff@gmail.com",
    packages=find_packages(where="scripts"),
    package_dir={"": "scripts"},
    install_requires=[
        "pandas",
        "openpyxl",
        "python-docx",
        "pdfminer.six",
        "requests",
        "beautifulsoup4",
        "lxml",
        "tabula-py",
        "numpy",
        "matplotlib",
        "seaborn",
        "click",
        "tqdm",
        "python-dotenv",
        "psycopg2-binary",
        "sqlalchemy",
        "flask",
        "flask-cors",
        "flask-sqlalchemy",
        "flask-migrate",
        "gunicorn"
    ],
    extras_require={
        "dev": [
            "pytest",
            "pytest-cov",
            "black",
            "flake8",
            "mypy",
            "pre-commit"
        ]
    },
    entry_points={
        "console_scripts": [
            "process-data=scripts.process_all:main",
            "scrape-documents=scripts.scraper:main",
            "generate-reports=scripts.reports:main",
            "validate-data=scripts.validator:main"
        ]
    },
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)