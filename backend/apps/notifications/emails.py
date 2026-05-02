"""
emails.py — Bihar Skill Hub Email Notification System
Place this file at: backend/apps/notifications/emails.py

Sends beautiful HTML emails for:
1. Welcome email after registration
2. OTP verification email
3. Enrollment confirmation
4. Certificate issued
5. Offer letter issued
6. Quiz passed / failed
7. Password changed
"""

import os
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


# ── Brand Config ──────────────────────────────────────────────────────────────
BRAND_NAME    = "Bihar Skill Hub"
BRAND_URL     = "https://biharskillhub.co.in"
BRAND_EMAIL   = "admin@biharskillhub.co.in"
BRAND_COLOR   = "#1d4ed8"
BRAND_ACCENT  = "#f59e0b"
WHATSAPP      = "919999999999"


def _base_template(title, preheader, body_html):
    """Base HTML email template with Bihar Skill Hub branding."""
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    * {{ margin:0; padding:0; box-sizing:border-box; }}
    body {{ font-family: Arial, Helvetica, sans-serif; background:#f0f4ff; color:#1e293b; }}
    .wrapper {{ max-width:600px; margin:0 auto; padding:20px; }}
    .card {{ background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }}
    .header {{ background:linear-gradient(135deg,#1e3a8a,#1d4ed8); padding:32px 24px; text-align:center; }}
    .header-logo {{ font-size:28px; font-weight:800; color:#fff; margin:0 0 4px; }}
    .header-sub   {{ font-size:13px; color:#bfdbfe; margin:0; }}
    .header-icon  {{ font-size:48px; margin-bottom:12px; display:block; }}
    .body         {{ padding:32px 24px; }}
    .greeting     {{ font-size:18px; font-weight:700; color:#1e293b; margin-bottom:16px; }}
    .text         {{ font-size:15px; color:#475569; line-height:1.7; margin-bottom:16px; }}
    .highlight-box {{
      background:linear-gradient(135deg,#eff6ff,#dbeafe);
      border:1px solid #93c5fd; border-radius:12px;
      padding:20px 24px; margin:20px 0;
    }}
    .highlight-box h3 {{ font-size:14px; color:#1e3a8a; margin-bottom:12px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; }}
    .info-row {{ display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e2e8f0; font-size:14px; }}
    .info-row:last-child {{ border-bottom:none; }}
    .info-label {{ color:#64748b; font-weight:600; }}
    .info-value {{ color:#1e293b; font-weight:700; }}
    .otp-box {{ background:#eff6ff; border:2px dashed #1d4ed8; border-radius:12px; padding:24px; margin:20px 0; text-align:center; }}
    .otp-code {{ font-size:42px; font-weight:800; color:#1d4ed8; letter-spacing:14px; }}
    .otp-note {{ font-size:13px; color:#64748b; margin-top:8px; }}
    .cta-btn {{
      display:inline-block; background:linear-gradient(135deg,#1e3a8a,#1d4ed8);
      color:#fff !important; text-decoration:none;
      padding:14px 32px; border-radius:10px;
      font-size:15px; font-weight:700;
      margin:20px 0; text-align:center;
    }}
    .cta-btn:hover {{ opacity:.9; }}
    .badge {{ display:inline-block; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; }}
    .badge-success {{ background:#d1fae5; color:#065f46; }}
    .badge-warning {{ background:#fef3c7; color:#92400e; }}
    .badge-info    {{ background:#dbeafe; color:#1e40af; }}
    .divider {{ border:none; border-top:1px solid #e2e8f0; margin:24px 0; }}
    .social-row {{ display:flex; gap:12px; justify-content:center; margin:16px 0; }}
    .social-btn {{
      display:inline-block; padding:8px 16px; border-radius:8px;
      font-size:13px; font-weight:600; text-decoration:none; color:#fff !important;
    }}
    .whatsapp-btn {{ background:#25d366; }}
    .website-btn  {{ background:#1d4ed8; }}
    .footer {{ background:#f8fafc; padding:20px 24px; text-align:center; border-top:1px solid #e2e8f0; }}
    .footer p {{ font-size:12px; color:#94a3b8; margin-bottom:4px; }}
    .footer a {{ color:#1d4ed8; text-decoration:none; }}
    .warning-box {{ background:#fff7ed; border:1px solid #fed7aa; border-radius:10px; padding:14px 16px; margin:16px 0; }}
    .warning-box p {{ font-size:13px; color:#c2410c; margin:0; }}
    @media (max-width:600px) {{
      .wrapper {{ padding:10px; }}
      .body     {{ padding:20px 16px; }}
      .otp-code {{ font-size:32px; letter-spacing:10px; }}
      .info-row {{ flex-direction:column; gap:4px; }}
    }}
  </style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;">{preheader}</div>
  <div class="wrapper">
    <div class="card">
      {body_html}
      <div class="footer">
        <p>© 2025 <strong>{BRAND_NAME}</strong> · Bihar, India</p>
        <p><a href="{BRAND_URL}">{BRAND_URL}</a> · <a href="mailto:{BRAND_EMAIL}">{BRAND_EMAIL}</a></p>
        <p style="margin-top:8px;font-size:11px;">You received this email because you are registered on Bihar Skill Hub.</p>
      </div>
    </div>
  </div>
</body>
</html>
"""


def _send(to_email, subject, text_body, html_body):
    """Send email using Django's EmailMultiAlternatives."""
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=f"{BRAND_NAME} <{BRAND_EMAIL}>",
            to=[to_email],
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=False)
        return True
    except Exception as e:
        if settings.DEBUG:
            print(f"[Email Error] {e}")
        return False


# ══════════════════════════════════════════════════════════════════════════════
# 1. WELCOME EMAIL — After Registration
# ══════════════════════════════════════════════════════════════════════════════
def send_welcome_email(user):
    subject = f"🎉 Welcome to Bihar Skill Hub, {user.full_name.split()[0]}!"
    body_html = _base_template(
        title=subject,
        preheader="Your account is ready. Start learning today!",
        body_html=f"""
      <div class="header">
        <span class="header-icon">🎓</span>
        <div class="header-logo">{BRAND_NAME}</div>
        <p class="header-sub">Welcome to Bihar's #1 Online Skill Platform</p>
      </div>
      <div class="body">
        <p class="greeting">Welcome, {user.full_name}! 🎉</p>
        <p class="text">
          You have successfully registered on <strong>Bihar Skill Hub</strong>.
          Your journey to a successful tech career starts today!
        </p>
        <div class="highlight-box">
          <h3>🚀 What you can do now</h3>
          <div class="info-row"><span class="info-label">📚 Browse Courses</span><span class="info-value">33+ courses available</span></div>
          <div class="info-row"><span class="info-label">🆓 Free Courses</span><span class="info-value">Enroll instantly</span></div>
          <div class="info-row"><span class="info-label">🏆 Certificates</span><span class="info-value">Auto-generated on completion</span></div>
          <div class="info-row"><span class="info-label">📄 Offer Letters</span><span class="info-value">Issued by Bihar Skill Hub</span></div>
        </div>
        <div style="text-align:center;">
          <a href="{BRAND_URL}/courses" class="cta-btn">🚀 Start Learning Now</a>
        </div>
        <hr class="divider">
        <p class="text" style="font-size:13px;color:#94a3b8;">
          Your registered email: <strong>{user.email}</strong><br>
          If you did not create this account, please contact us immediately.
        </p>
        <div class="social-row">
          <a href="https://wa.me/{WHATSAPP}" class="social-btn whatsapp-btn">💬 WhatsApp Support</a>
          <a href="{BRAND_URL}" class="social-btn website-btn">🌐 Visit Website</a>
        </div>
      </div>
    """)
    _send(user.email, subject,
          f"Welcome to Bihar Skill Hub, {user.full_name}! Visit {BRAND_URL} to start learning.",
          body_html)


# ══════════════════════════════════════════════════════════════════════════════
# 2. OTP EMAIL — During Registration
# ══════════════════════════════════════════════════════════════════════════════
def send_otp_email(email, otp_code):
    subject = f"🔐 Your OTP for Bihar Skill Hub Registration: {otp_code}"
    body_html = _base_template(
        title=subject,
        preheader=f"Your OTP is {otp_code}. Valid for 10 minutes.",
        body_html=f"""
      <div class="header">
        <span class="header-icon">🔐</span>
        <div class="header-logo">{BRAND_NAME}</div>
        <p class="header-sub">Email Verification</p>
      </div>
      <div class="body">
        <p class="greeting">Verify Your Email</p>
        <p class="text">Use the OTP below to complete your registration on Bihar Skill Hub:</p>
        <div class="otp-box">
          <div class="otp-code">{otp_code}</div>
          <div class="otp-note">⏱ Valid for <strong>10 minutes</strong> only</div>
        </div>
        <div class="warning-box">
          <p>⚠️ <strong>Never share this OTP with anyone.</strong> Bihar Skill Hub will never ask for your OTP.</p>
        </div>
        <p class="text" style="font-size:13px;color:#94a3b8;">
          If you did not request this OTP, please ignore this email.
          Your email will not be registered without verification.
        </p>
      </div>
    """)
    _send(email, subject,
          f"Your Bihar Skill Hub OTP is: {otp_code}. Valid for 10 minutes. Never share this OTP.",
          body_html)


# ══════════════════════════════════════════════════════════════════════════════
# 3. ENROLLMENT CONFIRMATION — After enrolling in a course
# ══════════════════════════════════════════════════════════════════════════════
def send_enrollment_email(enrollment):
    student = enrollment.student
    course  = enrollment.course
    subject = f"✅ Enrolled in {course.title} — Bihar Skill Hub"
    body_html = _base_template(
        title=subject,
        preheader=f"You are now enrolled in {course.title}. Start learning!",
        body_html=f"""
      <div class="header">
        <span class="header-icon">📚</span>
        <div class="header-logo">{BRAND_NAME}</div>
        <p class="header-sub">Enrollment Confirmation</p>
      </div>
      <div class="body">
        <p class="greeting">Congratulations, {student.full_name.split()[0]}! 🎉</p>
        <p class="text">
          You have successfully enrolled in <strong>{course.title}</strong>.
          Your learning journey has officially begun!
        </p>
        <div class="highlight-box">
          <h3>📋 Enrollment Details</h3>
          <div class="info-row"><span class="info-label">📚 Course</span><span class="info-value">{course.title}</span></div>
          <div class="info-row"><span class="info-label">🗂️ Category</span><span class="info-value">{course.category.name if course.category else "—"}</span></div>
          <div class="info-row"><span class="info-label">⏱ Duration</span><span class="info-value">{course.duration_hours} hours</span></div>
          <div class="info-row"><span class="info-label">📊 Level</span><span class="info-value">{course.level.title()}</span></div>
          <div class="info-row"><span class="info-label">✅ Status</span><span class="info-value"><span class="badge badge-success">Active</span></span></div>
          <div class="info-row"><span class="info-label">🏆 Certificate</span><span class="info-value">On course completion + quiz</span></div>
        </div>
        <div style="text-align:center;">
          <a href="{BRAND_URL}/profile" class="cta-btn">📖 Start Learning Now</a>
        </div>
        <p class="text" style="font-size:13px;">
          💡 <strong>Tip:</strong> Complete the course quiz with {course.passing_score}%+ to earn your certificate!
        </p>
        <div class="social-row">
          <a href="https://wa.me/{WHATSAPP}" class="social-btn whatsapp-btn">💬 Need Help?</a>
          <a href="{BRAND_URL}/profile" class="social-btn website-btn">📊 My Dashboard</a>
        </div>
      </div>
    """)
    _send(student.email, subject,
          f"You are enrolled in {course.title}. Visit {BRAND_URL}/profile to start learning.",
          body_html)


# ══════════════════════════════════════════════════════════════════════════════
# 4. CERTIFICATE ISSUED — After passing quiz
# ══════════════════════════════════════════════════════════════════════════════
def send_certificate_email(certificate):
    student = certificate.student
    course  = certificate.course
    subject = f"🏆 Your Certificate is Ready — {course.title}"
    body_html = _base_template(
        title=subject,
        preheader=f"Congratulations! Your certificate for {course.title} is ready.",
        body_html=f"""
      <div class="header">
        <span class="header-icon">🏆</span>
        <div class="header-logo">{BRAND_NAME}</div>
        <p class="header-sub">Certificate of Completion</p>
      </div>
      <div class="body">
        <p class="greeting">Outstanding Achievement, {student.full_name.split()[0]}! 🎊</p>
        <p class="text">
          You have successfully completed <strong>{course.title}</strong>
          and passed the assessment. Your certificate is now ready!
        </p>
        <div class="highlight-box">
          <h3>🏆 Certificate Details</h3>
          <div class="info-row"><span class="info-label">👤 Student</span><span class="info-value">{student.full_name}</span></div>
          <div class="info-row"><span class="info-label">📚 Course</span><span class="info-value">{course.title}</span></div>
          <div class="info-row"><span class="info-label">🏢 Issued By</span><span class="info-value">Bihar Skill Hub</span></div>
          <div class="info-row"><span class="info-label">🆔 Certificate ID</span><span class="info-value" style="font-family:monospace;font-size:12px;">{certificate.certificate_id}</span></div>
          <div class="info-row"><span class="info-label">🔗 Verify</span><span class="info-value"><a href="{BRAND_URL}/verify/{certificate.certificate_id}" style="color:#1d4ed8;">Click to Verify</a></span></div>
        </div>
        <div style="text-align:center;">
          <a href="{BRAND_URL}/profile" class="cta-btn">⬇️ Download Certificate</a>
        </div>
        <p class="text" style="font-size:13px;">
          🌟 <strong>Share your achievement!</strong> Add this certificate to your LinkedIn profile
          and resume to boost your career.
        </p>
        <div class="social-row">
          <a href="https://wa.me/{WHATSAPP}?text=I just got my certificate for {course.title} from Bihar Skill Hub!" class="social-btn whatsapp-btn">📤 Share on WhatsApp</a>
          <a href="{BRAND_URL}/verify/{certificate.certificate_id}" class="social-btn website-btn">🔍 Verify Certificate</a>
        </div>
      </div>
    """)
    _send(student.email, subject,
          f"Your certificate for {course.title} is ready! Download at {BRAND_URL}/profile",
          body_html)


# ══════════════════════════════════════════════════════════════════════════════
# 5. OFFER LETTER ISSUED
# ══════════════════════════════════════════════════════════════════════════════
def send_offer_letter_email(certificate):
    student = certificate.student
    course  = certificate.course
    subject = f"📄 Offer Letter from Bihar Skill Hub — {course.title}"
    body_html = _base_template(
        title=subject,
        preheader=f"Your offer letter for {certificate.role or 'Intern'} position is ready.",
        body_html=f"""
      <div class="header">
        <span class="header-icon">📄</span>
        <div class="header-logo">{BRAND_NAME}</div>
        <p class="header-sub">Offer Letter</p>
      </div>
      <div class="body">
        <p class="greeting">Congratulations, {student.full_name.split()[0]}! 🎉</p>
        <p class="text">
          We are pleased to inform you that Bihar Skill Hub has issued you an
          <strong>Offer Letter</strong> in recognition of your dedication and hard work.
        </p>
        <div class="highlight-box">
          <h3>📋 Offer Details</h3>
          <div class="info-row"><span class="info-label">👤 Name</span><span class="info-value">{student.full_name}</span></div>
          <div class="info-row"><span class="info-label">💼 Role</span><span class="info-value">{certificate.role or "Intern"}</span></div>
          <div class="info-row"><span class="info-label">📚 Course</span><span class="info-value">{course.title}</span></div>
          {f'<div class="info-row"><span class="info-label">💰 Stipend</span><span class="info-value">{certificate.stipend}</span></div>' if certificate.stipend else ""}
          {f'<div class="info-row"><span class="info-label">📅 Start Date</span><span class="info-value">{certificate.start_date}</span></div>' if certificate.start_date else ""}
          <div class="info-row"><span class="info-label">🏢 Issued By</span><span class="info-value">Bihar Skill Hub</span></div>
        </div>
        <div style="text-align:center;">
          <a href="{BRAND_URL}/profile" class="cta-btn">⬇️ Download Offer Letter</a>
        </div>
        <p class="text" style="font-size:13px;">
          Add this offer letter to your resume and LinkedIn profile!
        </p>
        <div class="social-row">
          <a href="https://wa.me/{WHATSAPP}" class="social-btn whatsapp-btn">💬 Contact Us</a>
          <a href="{BRAND_URL}/profile" class="social-btn website-btn">📊 My Profile</a>
        </div>
      </div>
    """)
    _send(student.email, subject,
          f"Your offer letter from Bihar Skill Hub is ready! Download at {BRAND_URL}/profile",
          body_html)


# ══════════════════════════════════════════════════════════════════════════════
# 6. QUIZ RESULT — Pass or Fail
# ══════════════════════════════════════════════════════════════════════════════
def send_quiz_result_email(attempt):
    student = attempt.student
    passed  = attempt.passed
    score   = attempt.score
    subject = (
        f"🎉 You Passed! Score: {score}%" if passed
        else f"📝 Quiz Result: {score}% — Keep Trying!"
    )
    body_html = _base_template(
        title=subject,
        preheader=f"Your quiz score is {score}%. {'Certificate is on its way!' if passed else 'Try again to earn your certificate.'}",
        body_html=f"""
      <div class="header">
        <span class="header-icon">{"🎉" if passed else "📝"}</span>
        <div class="header-logo">{BRAND_NAME}</div>
        <p class="header-sub">Quiz Result</p>
      </div>
      <div class="body">
        <p class="greeting">{"Congratulations!" if passed else "Good effort,"} {student.full_name.split()[0]}!</p>
        <p class="text">
          {"You have passed the quiz and earned your certificate! 🏆" if passed
           else "You did not pass this time, but don't give up! Review the material and try again."}
        </p>
        <div class="highlight-box">
          <h3>📊 Quiz Summary</h3>
          <div class="info-row"><span class="info-label">📊 Your Score</span><span class="info-value" style="font-size:20px;color:{"#10b981" if passed else "#dc2626"};">{score}%</span></div>
          <div class="info-row"><span class="info-label">✅ Result</span><span class="info-value"><span class="badge {"badge-success" if passed else "badge-warning"}">{"PASSED ✅" if passed else "FAILED ❌"}</span></span></div>
        </div>
        {"<p class='text'>🏆 Your certificate is being generated and will be available in your profile shortly.</p>" if passed
         else "<p class='text'>💡 Review the course material carefully and attempt the quiz again. You can do it!</p>"}
        <div style="text-align:center;">
          <a href="{BRAND_URL}/profile" class="cta-btn">{"🏆 View Certificate" if passed else "🔄 Try Again"}</a>
        </div>
      </div>
    """)
    _send(student.email, subject,
          f"Your quiz score is {score}%. {'Passed!' if passed else 'Try again!'} Visit {BRAND_URL}/profile",
          body_html)


# ══════════════════════════════════════════════════════════════════════════════
# 7. PASSWORD CHANGED
# ══════════════════════════════════════════════════════════════════════════════
def send_password_changed_email(user):
    subject = "🔒 Password Changed — Bihar Skill Hub"
    body_html = _base_template(
        title=subject,
        preheader="Your Bihar Skill Hub password was recently changed.",
        body_html=f"""
      <div class="header">
        <span class="header-icon">🔒</span>
        <div class="header-logo">{BRAND_NAME}</div>
        <p class="header-sub">Security Alert</p>
      </div>
      <div class="body">
        <p class="greeting">Hi {user.full_name.split()[0]},</p>
        <p class="text">
          Your Bihar Skill Hub account password was successfully changed.
        </p>
        <div class="warning-box">
          <p>⚠️ <strong>If you did not change your password</strong>, your account may be compromised.
          Contact us immediately at <a href="mailto:{BRAND_EMAIL}">{BRAND_EMAIL}</a></p>
        </div>
        <div style="text-align:center;">
          <a href="https://wa.me/{WHATSAPP}" class="cta-btn">🆘 Report Issue</a>
        </div>
      </div>
    """)
    _send(user.email, subject,
          f"Your Bihar Skill Hub password was changed. If this wasn't you, contact {BRAND_EMAIL}",
          body_html)


# ══════════════════════════════════════════════════════════════════════════════
# 8. PAYMENT SUCCESS
# ══════════════════════════════════════════════════════════════════════════════
def send_payment_success_email(payment):
    student = payment.student
    course  = payment.course
    subject = f"✅ Payment Successful — {course.title}"
    body_html = _base_template(
        title=subject,
        preheader=f"Payment of ₹{payment.amount} received for {course.title}.",
        body_html=f"""
      <div class="header">
        <span class="header-icon">✅</span>
        <div class="header-logo">{BRAND_NAME}</div>
        <p class="header-sub">Payment Confirmation</p>
      </div>
      <div class="body">
        <p class="greeting">Payment Successful, {student.full_name.split()[0]}! 💰</p>
        <p class="text">
          Your payment has been received and you are now enrolled in
          <strong>{course.title}</strong>.
        </p>
        <div class="highlight-box">
          <h3>🧾 Payment Receipt</h3>
          <div class="info-row"><span class="info-label">📚 Course</span><span class="info-value">{course.title}</span></div>
          <div class="info-row"><span class="info-label">💰 Amount Paid</span><span class="info-value">₹{payment.amount}</span></div>
          <div class="info-row"><span class="info-label">🆔 Payment ID</span><span class="info-value" style="font-family:monospace;font-size:12px;">{payment.razorpay_payment_id or "—"}</span></div>
          <div class="info-row"><span class="info-label">✅ Status</span><span class="info-value"><span class="badge badge-success">Paid</span></span></div>
        </div>
        <div style="text-align:center;">
          <a href="{BRAND_URL}/profile" class="cta-btn">📖 Start Learning</a>
        </div>
      </div>
    """)
    _send(student.email, subject,
          f"Payment of ₹{payment.amount} received for {course.title}. Visit {BRAND_URL}/profile",
          body_html)
