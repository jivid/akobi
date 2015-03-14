import smtplib

from tornado.web import RequestHandler
from validate_email import validate_email

from akobi.lib.applications.registry import registry
from akobi.lib.redis_client import redis_client
from akobi.lib.utils import make_random_string


applications = registry.available.keys()
applications.remove("Heartbeat")


class IndexHandler(RequestHandler):
    SMTP_SERVER = 'smtp.gmail.com:587'
    AKOBI_EMAIL_ADDRESS = 'AkobiInterview@gmail.com'
    AKOBI_EMAIL_PASSWORD = 'AppleOrange'
    AKOBI_EMAIL_SUBJECT = 'Akobi Interview'

    def _start_smtp_server(self):
        server = smtplib.SMTP(self.SMTP_SERVER)
        server.ehlo()
        server.starttls()
        server.login(self.AKOBI_EMAIL_ADDRESS, self.AKOBI_EMAIL_PASSWORD)

        return server

    def _make_email_message(self, to_addr, msg):
        return "\r\n".join([
            "From: %s" % self.AKOBI_EMAIL_ADDRESS,
            "To: %s" % to_addr,
            "Subject: %s" % self.AKOBI_EMAIL_SUBJECT,
            "",
            msg
        ])

    def _send_interviewer_email(self, smtp_server, interviewer, link):
        body = (
            "You've created an Akobi Interview!\n\n"
            "Here's the link: %s" % (link)
        )

        email = self._make_email_message(interviewer, body)
        smtp_server.sendmail(self.AKOBI_EMAIL_ADDRESS, interviewer, email)

    def _send_interviewee_email(self, smtp_server, interviewee, link):
        body = (
            "You've been invited to an Akobi Interview!\n\n"
            "Here's the link: %s" % (link)
        )

        email = self._make_email_message(interviewee, body)
        smtp_server.sendmail(self.AKOBI_EMAIL_ADDRESS, interviewee, email)

    def _get_and_store(self, interview_id, arg_key):
        redis = redis_client.get_redis_instance()
        interview_key = "interview:%s" % interview_id

        arg_value = self.get_argument(arg_key)
        redis.hset(interview_key, arg_key, arg_value)

        return arg_value

    def get(self, *args, **kwargs):
        self.render('index.html')

    def post(self, *args, **kwargs):
        interview_id = make_random_string()

        interviewer = self._get_and_store(interview_id, 'interviewer_email')
        interviewee = self._get_and_store(interview_id, 'interviewee_email')

        self._get_and_store(interview_id, 'interviewer_name')
        self._get_and_store(interview_id, 'interviewee_name')

        interview_link = "http://akobi.info/i/%s" % interview_id
        smtp_server = self._start_smtp_server()

        if validate_email(interviewer):
            self._send_interviewer_email(smtp_server, interviewer,
                                         interview_link)

        if validate_email(interviewee):
            self._send_interviewee_email(smtp_server, interviewee,
                                         interview_link)

        smtp_server.quit()
        self.write({'interviewID': interview_id})
