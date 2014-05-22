import logging

logFormatter = logging.Formatter("%(asctime)s [%(threadName)-12.12s]"
                                 + " [%(levelname)-5.5s] %(message)s")
rootLogger = logging.getLogger()

fileHandler = logging.FileHandler(filename='akobi_output.log')
fileHandler.setFormatter(logFormatter)
rootLogger.addHandler(fileHandler)

consoleHandler = logging.StreamHandler()
consoleHandler.setFormatter(logFormatter)
rootLogger.addHandler(consoleHandler)

rootLogger.setLevel(logging.DEBUG)

log = rootLogger
