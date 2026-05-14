# All metadata lives in pyproject.toml (PEP 621).
# This shim only exists so `pip install -e .` works in older pip versions.
from setuptools import setup

setup()
