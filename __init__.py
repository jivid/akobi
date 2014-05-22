'''
Logging component. Implemented according to:

http://stackoverflow.com/questions/13733552/
logger-configuration-to-log-to-file-and-print-to-stdout
'''

import logging

log_formatter = logging.Formatter("%(asctime)s [%(threadName)s]"
                                 + " [%(levelname)s] %(message)s")
root_logger = logging.getLogger()

file_handler = logging.FileHandler(filename='akobi_output.log')
file_handler.setFormatter(log_formatter)
root_logger.addHandler(file_handler)

console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)
root_logger.addHandler(console_handler)

root_logger.setLevel(logging.INFO)

log = root_logger
