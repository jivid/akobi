import logging
import os
import shutil
import sys

from fabric.operations import local as run
from fabric.api import task

log = logging.getLogger()
log.setLevel(logging.INFO)

stdout = logging.StreamHandler(sys.stdout)
stdout.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s %(levelname)s - %(message)s')
stdout.setFormatter(formatter)
log.addHandler(stdout)

PROJECT_ROOT = os.path.dirname(__file__)
STATIC_PATH = os.path.join(PROJECT_ROOT, 'static')


def prepare_build_dirs():
    """ Create the build folders for js and css files
    """
    for d in ['js', 'css']:
        path = os.path.join(STATIC_PATH, d, 'build')
        if not os.path.exists(path):
            os.makedirs(path)


def clean_dirs():
    """ Remove the build folders under static/js and static/css
    """
    for d in ['js', 'css']:
        path = os.path.join(STATIC_PATH, d, 'build')
        if os.path.exists(path) and os.path.isdir(path):
            shutil.rmtree(path)


def build_css():
    less_file = os.path.join(STATIC_PATH, 'less', 'akobi.less')
    css_file = os.path.join(STATIC_PATH, 'css', 'build', 'akobi.css')

    run("lessc --compress %s > %s" % (less_file, css_file))


def transform_jsx():
    js_dir = os.path.join(STATIC_PATH, 'js')
    js_src = os.path.join(js_dir, 'src')
    js_ext = os.path.join(js_dir, 'ext')
    js_build = os.path.join(js_dir, 'build')
    js_build_ext = os.path.join(js_build, 'ext')

    # transform JSX
    run("jsx %s %s" % (js_src, js_build))

    # copy external libs
    os.makedirs(js_build_ext)
    run("cp -Rf %s %s" % (js_ext, js_build))


@task
def build():
    print "Cleaning up old files"
    clean_dirs()

    print "Preparing for build"
    prepare_build_dirs()

    print "Compiling LESS to CSS"
    build_css()

    less_file = os.path.join(STATIC_PATH, 'less', 'akobi_refactor.less')
    css_file = os.path.join(STATIC_PATH, 'css', 'build', 'akobi_refactor.css')

    run("lessc --compress %s > %s" % (less_file, css_file))

    print "Transforming JSX"
    transform_jsx()


@task
def refactor():
    print "Cleaning up old files"
    clean_dirs()

    print "Preparing for build"
    prepare_build_dirs()

    print "Compiling LESS to CSS"
    build_css()

    less_file = os.path.join(STATIC_PATH, 'less', 'akobi_refactor.less')
    css_file = os.path.join(STATIC_PATH, 'css', 'build', 'akobi_refactor.css')

    run("lessc --compress %s > %s" % (less_file, css_file))
    run("jsx --harmony static/js/src/ static/js/build/")
    run("browserify static/js/build/refactor/AuthSpace.js -o "
            "static/js/build/authspace.js")
    run("browserify static/js/build/refactor/AppSpace.js -o "
            "static/js/build/appspace.js")


@task
def deps():
    """ Install project-specific python and JS dependencies
    """
    run("pip install -r requirements.txt")
    js_packages = ['react', 'backbone', 'jquery', 'underscore', 'brace']
    pkgs = ' '.join(js_packages)
    run("npm install --prefix ./static/js/ %s" % pkgs)


@task
def deploy(deploy_type=None, branch=None):
    """ Deploy develop, master or a custom branch
    Example usage:
    $ fab deploy:develop  # Will deploy the develop branch to dev.akobi.info
    $ fab deploy:master   # Will deploy the master branch to www.akobi.info

    # Will deploy a custom branch from github to exp.akobi.info
    $ fab deploy:experimental,branch=react_browserify
    """
    deploy_type = deploy_type if deploy_type is not None else 'develop'

    if deploy_type in ('develop', 'master') and branch is not None:
        log.info("Cannot deploy custom branch with %s. "
                 "Ignoring branch name" % (deploy_type))
        branch = None

    if deploy_type == 'experimental' and branch is None:
        log.fatal("Deploying 'experimental' requires a branch name")
        return

    pass
