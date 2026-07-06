import smtplib
from email.mime.text import MIMEText
import secrets
from app.config import settings


def send_verification_code(to_email: str) -> str:
    code = f"{secrets.randbelow(1_000_000):09d}"
    msg = MIMEText(f"Your verification code: {code}")
    msg["Subject"] = "CoWorkHub — Email Verification"
    msg["From"] = settings.SMTP_USER
    msg["To"] = to_email

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
    return code
