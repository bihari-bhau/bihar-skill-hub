import React, { useState } from "react";

const WHATSAPP_NUMBER = "+919801917901";
const WHATSAPP_MSG    = encodeURIComponent("Hi! I want to know more about Bihar Skill Hub.");

const FAQS = [
  { q: "Are the courses 100% online?",            a: "Yes! All courses are fully online. You can learn from anywhere in Bihar or India." },
  { q: "Do I get a certificate after completion?", a: "Yes, you get a verified PDF certificate after completing the course and passing the quiz." },
  { q: "What is the minimum qualification?",       a: "Most courses require only 10+2. Some advanced courses require graduation. Check each course for eligibility." },
  { q: "How do I enroll in a course?",             a: "Register on our platform, browse courses, click Enroll and complete payment. Free courses are instant." },
  { q: "Is there an offer letter?",               a: "Yes! Admin issues offer letters to students who complete courses. Download from your profile." },
  { q: "Can I pay in installments?",              a: "Currently we support one-time payment via UPI, cards, and net banking through Razorpay." },
];

export default function ContactUs() {
  const [form, setForm]     = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent]     = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send via WhatsApp
    const msg = encodeURIComponent(
      `New Contact Form Submission\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nSubject: ${form.subject}\nMessage: ${form.message}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    setSent(true);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="contact-page">

      {/* Hero */}
      <section className="contact-hero">
        <div className="ss-hero-badge">📞 We're Here to Help</div>
        <h1>Contact Us</h1>
        <p>Have questions about our courses? We're just a message away!</p>
      </section>

      <div className="contact-body">

        {/* Contact Cards */}
        <div className="contact-cards">
          {[
            { icon: "📧", title: "Email Us",      value: "admin@biharskillhub.co.in", link: "mailto:admin@biharskillhub.co.in" },
            { icon: "💬", title: "WhatsApp",      value: "+919801917901",            link: `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}` },
            { icon: "🌐", title: "Website",       value: "biharskillhub.co.in",        link: "https://biharskillhub.co.in" },
            { icon: "📍", title: "Location",      value: "Bihar, India",               link: null },
          ].map((c) => (
            <div className="contact-card" key={c.title}>
              <span className="contact-card-icon">{c.icon}</span>
              <h4>{c.title}</h4>
              {c.link
                ? <a href={c.link} target="_blank" rel="noreferrer">{c.value}</a>
                : <p>{c.value}</p>
              }
            </div>
          ))}
        </div>

        <div className="contact-main">

          {/* Form */}
          <div className="contact-form-wrap">
            <h2>Send Us a Message</h2>
            <p>Fill the form below and we'll get back to you within 24 hours via WhatsApp.</p>

            {sent && (
              <div className="contact-success">
                ✅ Message sent successfully! We'll reply on WhatsApp soon.
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div className="contact-field">
                  <label>Full Name *</label>
                  <input type="text" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="contact-field">
                  <label>Email Address *</label>
                  <input type="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="contact-form-row">
                <div className="contact-field">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} />
                </div>
                <div className="contact-field">
                  <label>Subject *</label>
                  <select name="subject" value={form.subject} onChange={handleChange} required>
                    <option value="">Select subject</option>
                    <option value="Course Inquiry">Course Inquiry</option>
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="Certificate Issue">Certificate Issue</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Internship Query">Internship Query</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="contact-field">
                <label>Message *</label>
                <textarea name="message" placeholder="Write your message here..." rows={5} value={form.message} onChange={handleChange} required />
              </div>
              <button type="submit" className="contact-submit-btn">
                💬 Send via WhatsApp
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="contact-faq">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {FAQS.map((faq, i) => (
                <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={i}>
                  <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {faq.q}
                    <span>{openFaq === i ? "−" : "+"}</span>
                  </button>
                  {openFaq === i && <p className="faq-answer">{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Float */}
      <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`} target="_blank" rel="noreferrer" className="whatsapp-float">
        <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span>Chat with us</span>
      </a>
    </div>
  );
}