import smtplib

from tornado.web import RequestHandler
from validate_email import validate_email

from akobi.lib.applications.registry import registry
from akobi.lib.redis_client import redis_client
from akobi.lib.utils import make_random_string


applications = registry.available.keys()
applications.remove("Heartbeat")


class IndexHandler(RequestHandler):
    def get(self, *args, **kwargs):
        self.render('index.html', applications=applications)


class TestHandler(RequestHandler):
    def get(self, *args, **kwargs):
        self.render('test.html')


class SetupHandler(RequestHandler):

    # SMTP Server Credentials
    smtp_username = 'AkobiInterview@gmail.com'
    smtp_password = 'AppleOrange'

    # Email fields
    akobi_email_addr = 'AkobiInterview@gmail.com'
    akobi_email_subject = 'Akobi Interview'

    def start_smtp_server(self):
        server = smtplib.SMTP('smtp.gmail.com:587')
        server.ehlo()
        server.starttls()
        server.login(self.smtp_username, self.smtp_password)

        return server

    def send_interviewee_email(self, smpt_server, interviewee, link):
        body = "You've been invited to an Akobi Interview! %s" % (link)
        msg = "\r\n".join([
          "From: %s" % self.akobi_email_addr,
          "To: %s" % interviewee,
          "Subject: %s" % self.akobi_email_subject,
          "",
          body
          ])
        smpt_server.sendmail(self.akobi_email_addr, interviewee, msg)

    def send_interviewer_email(self, smtp_server, interviewer, link):
        body = "You've created an Akobi Interview! %s" % (link)
        msg = "\r\n".join([
          "From: %s" % self.akobi_email_addr,
          "To: %s" % interviewer,
          "Subject: %s" % self.akobi_email_subject,
          "",
          body
          ])
        smtp_server.sendmail(self.akobi_email_addr, interviewer, msg)

    def get(self, *args, **kwargs):

        # HTML checkboxes pass nothing if they are unchecked
        application_state = {}
        interviewer = self.get_query_argument('interviewer_email')
        interviewee = self.get_query_argument('interviewee_email')

        for application in applications:
            if self.get_query_argument(application, None):
                application_state[application] = self.get_query_argument(
                    application)

        # TODO: We should probably do this more like a product serial than
        # just a random id.
        interview_id = make_random_string()

        redis = redis_client.get_redis_instance()
        interview_key = "interview:%s" % (interview_id)
        redis.hset(interview_key, "interviewer_email", interviewer)
        redis.hset(interview_key, "interviewee_email", interviewee)

        interview_link = "http://akobi.info/i/%s" % (interview_id)

        smtp_server = self.start_smtp_server()
        if (validate_email(interviewee)):
            self.send_interviewee_email(smtp_server, interviewee,
                                        interview_link)

        if (validate_email(interviewer)):
            self.send_interviewer_email(smtp_server, interviewer,
                                        interview_link)
        smtp_server.quit()

        # TODO: This page to be removed
        self.render(
            'setup_complete.html',
            interview_id=interview_id,
            application_state=application_state)
