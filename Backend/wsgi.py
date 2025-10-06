"""WSGI entrypoint for PythonAnywhere

This adapts the FastAPI ASGI app to a WSGI callable using asgiref.
Point your PythonAnywhere web app's WSGI configuration to import
`application` from this module.
"""

import os

# Ensure app package is importable if this file is executed directly
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in os.sys.path:
    os.sys.path.append(CURRENT_DIR)

from asgiref.wsgi import AsgiToWsgi  # type: ignore
from app.main import app as asgi_app

application = AsgiToWsgi(asgi_app)
