import logging
import os
import shutil
import sys

from fabric.operations import local as lrun
from fabric.api import env, sudo, task

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


@task
def clean():
    """ Remove the build folders under static/js and static/css
    """
    for d in ['js', 'css']:
        path = os.path.join(STATIC_PATH, d, 'build')
        if os.path.exists(path) and os.path.isdir(path):
            shutil.rmtree(path)


def transform_jsx():
    js_dir = os.path.join(STATIC_PATH, 'js')
    js_src = os.path.join(js_dir, 'src')
    js_ext = os.path.join(js_dir, 'ext')
    js_build = os.path.join(js_dir, 'build')
    js_build_ext = os.path.join(js_build, 'ext')

    # transform JSX
    lrun("jsx %s %s" % (js_src, js_build))

    # copy external libs
    os.makedirs(js_build_ext)
    lrun("cp -Rf %s %s" % (js_ext, js_build))


@task
def build():
    print "Cleaning up old files"
    clean()

    print "Preparing for build"
    prepare_build_dirs()

    print "Compiling LESS to CSS"
    less_file = os.path.join(STATIC_PATH, 'less', 'akobi.less')
    css_file = os.path.join(STATIC_PATH, 'css', 'build', 'akobi.css')

    lrun("lessc --compress %s > %s" % (less_file, css_file))
    lrun("jsx --harmony static/js/src/ static/js/build/")
    lrun("browserify static/js/build/AuthSpace.js -o "
         "static/js/build/Auth.js")
    lrun("browserify static/js/build/AppSpace.js -o "
         "static/js/build/App.js")


@task
def deps():
    """ Install project-specific python and JS dependencies
    """
    log.info("Installing python dependencies from requirements.txt")
    lrun("pip install -r requirements.txt")

    log.info("Installing JS dependencies")
    js_packages = ['react', 'backbone', 'jquery', 'underscore', 'brace']
    pkgs = ' '.join(js_packages)
    log.info(pkgs)
    lrun("npm install --prefix ./static/js/ %s" % pkgs)


@task
def deploy(deploy_type=None, branch=None):
    """ Deploy develop, master or a custom branch
    Example usage:
    $ fab deploy:develop  # Will deploy the develop branch to dev.akobi.info
    $ fab deploy:master   # Will deploy the master branch to www.akobi.info

    # Will deploy a custom branch from github to exp.akobi.info
    $ fab deploy:exp,branch=react_browserify
    """
    if deploy_type is None or\
            deploy_type not in ('develop', 'master', 'exp', 'experimental'):
        log.fatal("Must specify type of deploy (master, develop, exp)")
        return

    env.gateway = 'sshbastion.local.akobi.info'
    env.host_string = '10.0.0.130'
    build = None

    if deploy_type in ('develop', 'master'):
        if branch is not None:
            log.info("Cannot deploy custom branch with %s. "
                     "Ignoring branch name" % (deploy_type))

        branch = 'master' if deploy_type == 'master' else 'develop'
        build = 'fab local build'
        port = '8888'

    if deploy_type in ('exp', 'experimental'):
        if branch is None:
            log.fatal("Deploying experimental version requires a branch name")
            return

        deploy_type = 'exp'
        port = '8889'
        build = 'fab build'

    cmd = ' '.join([
        'nohup',
        '/var/www/scripts/fetch.sh',
        deploy_type,
        branch,
        port,
        build
    ])
    sudo(cmd)
