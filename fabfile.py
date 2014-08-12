import os
import shutil

from fabric.operations import local as lrun
from fabric.api import run, task
from fabric.state import env

PROJECT_ROOT = os.path.dirname(__file__)
STATIC_PATH = os.path.join(PROJECT_ROOT, 'static')


@task
def local():
    env.run = lrun


def prepare_build_dirs():
    for d in ['js', 'css']:
        path = os.path.join(STATIC_PATH, d, 'build')
        if not os.path.exists(path):
            os.makedirs(path)


def clean_dirs():
    for d in ['js', 'css']:
        path = os.path.join(STATIC_PATH, d, 'build')
        if os.path.exists(path) and os.path.isdir(path):
            shutil.rmtree(path)


def build_css():
    less_file = os.path.join(STATIC_PATH, 'less', 'akobi.less')
    css_file = os.path.join(STATIC_PATH, 'css', 'build', 'akobi.css')

    env.run("lessc --compress %s > %s" % (less_file, css_file))


def transform_jsx():
    js_dir = os.path.join(STATIC_PATH, 'js')
    js_src = os.path.join(js_dir, 'src')
    js_ext = os.path.join(js_dir, 'ext')
    js_build = os.path.join(js_dir, 'build')
    js_build_ext = os.path.join(js_build, 'ext')

    # transform JSX
    env.run("jsx %s %s" % (js_src, js_build))

    # copy external libs
    os.makedirs(js_build_ext)
    env.run("cp -Rf %s %s" % (js_ext, js_build))


@task
def build():
    print "Cleaning up old files"
    clean_dirs()

    print "Preparing for build"
    prepare_build_dirs()

    print "Compiling LESS to CSS"
    build_css()

    print "Transforming JSX"
    transform_jsx()
