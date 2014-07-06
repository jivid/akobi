import os

from fabric.api import local, env

PROJECT_ROOT = os.path.dirname(__file__)
STATIC_PATH = os.path.join(PROJECT_ROOT, 'static')

def build_css():
    less_file = os.path.join(STATIC_PATH, 'less', 'akobi.less')
    css_file = os.path.join(STATIC_PATH, 'akobi.css')
    local("lessc %s > %s" % (less_file, css_file))

def transform_jsx():
    pass

def build_assets():
    build_css()
    transform_jsx()
