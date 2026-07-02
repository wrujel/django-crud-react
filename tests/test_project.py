"""Project-scope coverage: WSGI/ASGI entrypoints, manage.py, settings parsing.

These modules are never imported by app tests, so they are exercised here to
keep the coverage report honest about every hand-written file.
"""

import importlib
import os
import runpy
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
MANAGE_PY = str(REPO_ROOT / "manage.py")


def test_wsgi_exposes_application():
    module = importlib.import_module("django_crud_api.wsgi")
    assert module.application is not None


def test_asgi_exposes_application():
    module = importlib.import_module("django_crud_api.asgi")
    assert module.application is not None


def test_manage_py_runs_a_management_command(monkeypatch):
    # Executed in-process via runpy so coverage records manage.py itself.
    monkeypatch.setattr(sys, "argv", ["manage.py", "check"])
    runpy.run_path(MANAGE_PY, run_name="__main__")


def test_manage_py_raises_helpful_import_error(monkeypatch):
    # A None entry in sys.modules forces the inner import to fail, driving
    # manage.py's ImportError branch with its "Couldn't import Django" hint.
    monkeypatch.setattr(sys, "argv", ["manage.py", "check"])
    monkeypatch.setitem(sys.modules, "django.core.management", None)
    with pytest.raises(ImportError, match="Couldn't import Django"):
        runpy.run_path(MANAGE_PY, run_name="__main__")


def _reload_settings_with_env(**env):
    """Reload the settings module under a temporary environment."""
    import django_crud_api.settings as settings_module

    previous = {key: os.environ.get(key) for key in env}
    os.environ.update(env)
    try:
        return importlib.reload(settings_module)
    finally:
        for key, value in previous.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value


def _restore_settings_module():
    import django_crud_api.settings as settings_module

    importlib.reload(settings_module)


def test_debug_env_parsing():
    # The live django.conf.settings holds its own copies taken at setup, so
    # reloading the module here does not affect other tests.
    try:
        assert _reload_settings_with_env(DEBUG="false").DEBUG is False
        assert _reload_settings_with_env(DEBUG="0").DEBUG is False
        assert _reload_settings_with_env(DEBUG="1").DEBUG is True
        assert _reload_settings_with_env(DEBUG="YES").DEBUG is True
        assert _reload_settings_with_env(DEBUG="on").DEBUG is True
    finally:
        _restore_settings_module()


def test_allowed_hosts_env_parsing():
    try:
        reloaded = _reload_settings_with_env(ALLOWED_HOSTS="a.com,b.com")
        assert reloaded.ALLOWED_HOSTS == ["a.com", "b.com"]
    finally:
        _restore_settings_module()


def test_secret_key_env_override():
    try:
        reloaded = _reload_settings_with_env(SECRET_KEY="test-secret")
        assert reloaded.SECRET_KEY == "test-secret"
    finally:
        _restore_settings_module()
