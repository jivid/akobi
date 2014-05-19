import logging

# logging.basicConfig(filename='logs.log',format='%(levelname)s:%(message)s',
# level=logging.DEBUG)

logging.basicConfig(
    format='%(levelname)s:%(message)s', level=logging.DEBUG)


def debug_log(text):
    logging.debug(text)


def info_log(text):
    logging.info(text)


def warning_log(text):
    logging.warning(text)


def error_log(text):
    logging.error(text)


def critical_log(text):
    logging.critical(text)
