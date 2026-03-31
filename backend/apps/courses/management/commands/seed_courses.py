"""
Management command: python manage.py seed_courses
Seeds all categories and courses for Bihar Skill Hub.
Safe to run multiple times — skips existing records.
"""

from django.core.management.base import BaseCommand
from django.utils.text import slugify
from datetime import date
from apps.courses.models import Category, Course

# Next batch dates
BATCH_APR = date(2025, 4, 15)
BATCH_MAY = date(2025, 5, 1)
BATCH_JUN = date(2025, 6, 1)

COURSES_DATA = [
    {
        "category": "Web Development",
        "courses": [
            {
                "title": "HTML & CSS Fundamentals",
                "description": "Master the building blocks of the web. Learn to create beautiful, responsive websites from scratch using HTML5 and CSS3. Covers Flexbox, Grid, animations, and modern best practices.",
                "duration_hours": 20, "level": "beginner", "price": 0, "is_free": True,
                "rating": 4.7, "students_count": 3240,
                "eligibility": "Any Branch", "next_batch_date": BATCH_APR, "language": "hinglish",
            },
            {
                "title": "Full Stack Web Development",
                "description": "Become a complete web developer — from frontend React to backend Node.js and Django. Build real-world projects including an e-commerce app and a social media platform.",
                "duration_hours": 80, "level": "intermediate", "price": 2999, "is_free": False,
                "rating": 4.8, "students_count": 1875,
                "eligibility": "Any Branch", "next_batch_date": BATCH_MAY, "language": "hinglish",
            },
            {
                "title": "Advanced React & Next.js",
                "description": "Deep dive into React hooks, context API, Redux Toolkit, and Next.js for server-side rendering. Learn performance optimization and deployment on Vercel.",
                "duration_hours": 45, "level": "advanced", "price": 1999, "is_free": False,
                "rating": 4.9, "students_count": 980,
                "eligibility": "CSE/IT", "next_batch_date": BATCH_JUN, "language": "english",
            },
        ],
    },
    {
        "category": "Data Science & AI",
        "courses": [
            {
                "title": "Python for Data Science",
                "description": "Learn Python programming with a focus on data analysis. Covers NumPy, Pandas, Matplotlib, and Seaborn. Work on real datasets from healthcare and finance domains.",
                "duration_hours": 35, "level": "beginner", "price": 1499, "is_free": False,
                "rating": 4.6, "students_count": 2150,
                "eligibility": "Any Branch", "next_batch_date": BATCH_APR, "language": "hinglish",
            },
            {
                "title": "Machine Learning A-Z",
                "description": "Comprehensive ML course covering supervised, unsupervised, and reinforcement learning. Implement algorithms from scratch and use scikit-learn, XGBoost, and TensorFlow.",
                "duration_hours": 60, "level": "intermediate", "price": 2499, "is_free": False,
                "rating": 4.8, "students_count": 1430,
                "eligibility": "CSE/IT/ECE", "next_batch_date": BATCH_MAY, "language": "hinglish",
            },
            {
                "title": "Deep Learning & Neural Networks",
                "description": "Build CNN, RNN, LSTM, and Transformer models using TensorFlow and PyTorch. Projects include image classification, sentiment analysis, and text generation.",
                "duration_hours": 55, "level": "advanced", "price": 2999, "is_free": False,
                "rating": 4.7, "students_count": 760,
                "eligibility": "CSE/IT", "next_batch_date": BATCH_JUN, "language": "english",
            },
        ],
    },
    {
        "category": "Mobile App Development",
        "courses": [
            {
                "title": "Android Development with Kotlin",
                "description": "Build native Android apps using Kotlin and Jetpack Compose. Learn Material Design, Firebase integration, and publish your app to the Google Play Store.",
                "duration_hours": 50, "level": "beginner", "price": 1999, "is_free": False,
                "rating": 4.6, "students_count": 1120,
                "eligibility": "Any Branch", "next_batch_date": BATCH_APR, "language": "hinglish",
            },
            {
                "title": "Flutter Cross-Platform Development",
                "description": "Create beautiful iOS and Android apps with a single codebase using Flutter and Dart. Covers state management with Provider & Riverpod, REST APIs, and local storage.",
                "duration_hours": 55, "level": "intermediate", "price": 2499, "is_free": False,
                "rating": 4.8, "students_count": 890,
                "eligibility": "CSE/IT", "next_batch_date": BATCH_MAY, "language": "hinglish",
            },
            {
                "title": "React Native for Professionals",
                "description": "Build production-grade mobile apps using React Native. Covers navigation, push notifications, payments integration, and CI/CD for mobile.",
                "duration_hours": 48, "level": "advanced", "price": 2499, "is_free": False,
                "rating": 4.7, "students_count": 640,
                "eligibility": "CSE/IT", "next_batch_date": BATCH_JUN, "language": "english",
            },
        ],
    },
    {
        "category": "Cybersecurity",
        "courses": [
            {
                "title": "Cybersecurity Essentials",
                "description": "Introduction to cybersecurity concepts — CIA triad, network security, firewalls, VPNs, and basic cryptography. Ideal for IT professionals and students.",
                "duration_hours": 25, "level": "beginner", "price": 0, "is_free": True,
                "rating": 4.5, "students_count": 2870,
                "eligibility": "Any Branch", "next_batch_date": BATCH_APR, "language": "hinglish",
            },
            {
                "title": "Ethical Hacking & Penetration Testing",
                "description": "Learn to think like a hacker to defend systems better. Covers reconnaissance, exploitation, privilege escalation, and report writing using Kali Linux.",
                "duration_hours": 60, "level": "intermediate", "price": 2999, "is_free": False,
                "rating": 4.9, "students_count": 1340,
                "eligibility": "CSE/IT/ECE", "next_batch_date": BATCH_MAY, "language": "hinglish",
            },
            {
                "title": "SOC Analyst & Incident Response",
                "description": "Become a Security Operations Center analyst. Covers SIEM tools, threat intelligence, malware analysis, digital forensics, and incident response playbooks.",
                "duration_hours": 50, "level": "advanced", "price": 3499, "is_free": False,
                "rating": 4.7, "students_count": 520,
                "eligibility": "CSE/IT", "next_batch_date": BATCH_JUN, "language": "english",
            },
        ],
    },
    {
        "category": "Digital Marketing",
        "courses": [
            {
                "title": "Digital Marketing Fundamentals",
                "description": "Understand the digital marketing ecosystem — SEO, SEM, social media, email marketing, and content strategy. Get Google Analytics and Ads certified.",
                "duration_hours": 30, "level": "beginner", "price": 0, "is_free": True,
                "rating": 4.5, "students_count": 3980,
                "eligibility": "Any Branch", "next_batch_date": BATCH_APR, "language": "hinglish",
            },
            {
                "title": "Social Media Marketing Mastery",
                "description": "Master Instagram, Facebook, LinkedIn, and YouTube marketing. Learn to run paid ad campaigns, create viral content, and build brand authority online.",
                "duration_hours": 35, "level": "intermediate", "price": 1499, "is_free": False,
                "rating": 4.6, "students_count": 2210,
                "eligibility": "Any Branch", "next_batch_date": BATCH_MAY, "language": "hinglish",
            },
            {
                "title": "SEO & Content Marketing",
                "description": "Advanced SEO techniques — on-page, off-page, technical SEO, link building, and content marketing strategy to rank #1 on Google and drive organic traffic.",
                "duration_hours": 40, "level": "advanced", "price": 1999, "is_free": False,
                "rating": 4.8, "students_count": 1100,
                "eligibility": "Any Branch", "next_batch_date": BATCH_JUN, "language": "english",
            },
        ],
    },
    {
        "category": "Graphic Design",
        "courses": [
            {
                "title": "Graphic Design for Beginners",
                "description": "Learn design principles — typography, color theory, layout, and composition. Hands-on projects using Canva and Adobe Express to create social media graphics.",
                "duration_hours": 22, "level": "beginner", "price": 0, "is_free": True,
                "rating": 4.6, "students_count": 2650,
                "eligibility": "Any Branch", "next_batch_date": BATCH_APR, "language": "hinglish",
            },
            {
                "title": "Adobe Photoshop & Illustrator",
                "description": "Professional image editing with Photoshop and vector design with Illustrator. Create logos, posters, banners, and UI mockups for real client projects.",
                "duration_hours": 45, "level": "intermediate", "price": 1999, "is_free": False,
                "rating": 4.7, "students_count": 1560,
                "eligibility": "Any Branch", "next_batch_date": BATCH_MAY, "language": "hinglish",
            },
            {
                "title": "UI/UX Design with Figma",
                "description": "Design world-class user interfaces with Figma. Covers wireframing, prototyping, design systems, user research, and handing off to developers.",
                "duration_hours": 50, "level": "advanced", "price": 2499, "is_free": False,
                "rating": 4.9, "students_count": 980,
                "eligibility": "Any Branch", "next_batch_date": BATCH_JUN, "language": "english",
            },
        ],
    },
    {
        "category": "Internet of Things",
        "courses": [
            {
                "title": "IoT Fundamentals with Arduino",
                "description": "Get started with IoT using Arduino — sensors, actuators, serial communication, and basic circuits. Build 5 hands-on projects including a smart temperature monitor.",
                "duration_hours": 28, "level": "beginner", "price": 999, "is_free": False,
                "rating": 4.5, "students_count": 870,
                "eligibility": "ECE/EE/Mechanical", "next_batch_date": BATCH_APR, "language": "hinglish",
            },
            {
                "title": "Raspberry Pi & Smart Home Automation",
                "description": "Build smart home systems with Raspberry Pi. Covers Python GPIO programming, MQTT protocol, Node-RED, and integration with Alexa and Google Home.",
                "duration_hours": 40, "level": "intermediate", "price": 1999, "is_free": False,
                "rating": 4.7, "students_count": 560,
                "eligibility": "ECE/EE/CSE", "next_batch_date": BATCH_MAY, "language": "hinglish",
            },
            {
                "title": "Industrial IoT & Cloud Integration",
                "description": "Connect industrial devices to AWS IoT Core, Azure IoT Hub, and Google Cloud IoT. Covers MQTT, CoAP, OPC-UA, and real-time dashboard with Grafana.",
                "duration_hours": 50, "level": "advanced", "price": 2999, "is_free": False,
                "rating": 4.6, "students_count": 320,
                "eligibility": "ECE/EE/CSE", "next_batch_date": BATCH_JUN, "language": "english",
            },
        ],
    },
    {
        "category": "Prompt Engineering",
        "courses": [
            {
                "title": "Prompt Engineering Basics",
                "description": "Learn how to communicate effectively with AI models like ChatGPT, Claude, and Gemini. Covers zero-shot, few-shot, and chain-of-thought prompting techniques.",
                "duration_hours": 15, "level": "beginner", "price": 0, "is_free": True,
                "rating": 4.8, "students_count": 4200,
                "eligibility": "Any Branch", "next_batch_date": BATCH_APR, "language": "hinglish",
            },
            {
                "title": "Advanced Prompt Engineering for Developers",
                "description": "Build AI-powered applications using prompt chaining, RAG, function calling, and agents. Integrates OpenAI API, LangChain, and vector databases.",
                "duration_hours": 35, "level": "intermediate", "price": 1999, "is_free": False,
                "rating": 4.9, "students_count": 1870,
                "eligibility": "CSE/IT", "next_batch_date": BATCH_MAY, "language": "hinglish",
            },
            {
                "title": "LLM Fine-tuning & Custom AI Models",
                "description": "Fine-tune large language models on custom datasets using LoRA and QLoRA. Deploy models using FastAPI and Hugging Face Spaces for production use.",
                "duration_hours": 45, "level": "advanced", "price": 3499, "is_free": False,
                "rating": 4.8, "students_count": 430,
                "eligibility": "CSE/IT", "next_batch_date": BATCH_JUN, "language": "english",
            },
        ],
    },
    {
        "category": "Java Full Stack",
        "courses": [
            {
                "title": "Core Java Programming",
                "description": "Master Java fundamentals — OOP, collections, generics, exception handling, and multithreading. Solve 100+ coding problems to build strong problem-solving skills.",
                "duration_hours": 40, "level": "beginner", "price": 1499, "is_free": False,
                "rating": 4.6, "students_count": 2340,
                "eligibility": "Any Branch", "next_batch_date": BATCH_APR, "language": "hinglish",
            },
            {
                "title": "Spring Boot & Microservices",
                "description": "Build enterprise-grade REST APIs using Spring Boot, Spring Security, and JPA/Hibernate. Deploy microservices on Docker and Kubernetes with CI/CD pipelines.",
                "duration_hours": 65, "level": "intermediate", "price": 2999, "is_free": False,
                "rating": 4.8, "students_count": 1230,
                "eligibility": "CSE/IT", "next_batch_date": BATCH_MAY, "language": "hinglish",
            },
            {
                "title": "Java Full Stack with Angular",
                "description": "End-to-end full stack development with Spring Boot backend and Angular frontend. Includes JWT auth, role-based access control, and deployment on AWS EC2.",
                "duration_hours": 75, "level": "advanced", "price": 3499, "is_free": False,
                "rating": 4.7, "students_count": 680,
                "eligibility": "CSE/IT", "next_batch_date": BATCH_JUN, "language": "english",
            },
        ],
    },
    {
        "category": "Manual Testing",
        "courses": [
            {
                "title": "Software Testing Fundamentals",
                "description": "Introduction to software testing — SDLC, STLC, types of testing, test case design, bug life cycle, and defect reporting using JIRA. Ideal for freshers.",
                "duration_hours": 25, "level": "beginner", "price": 0, "is_free": True,
                "rating": 4.5, "students_count": 3100,
                "eligibility": "Any Branch", "next_batch_date": BATCH_APR, "language": "hinglish",
            },
            {
                "title": "Manual Testing with JIRA & TestRail",
                "description": "Master manual testing techniques — black box, white box, regression, smoke, and UAT. Write effective test cases and manage test cycles in JIRA and TestRail.",
                "duration_hours": 35, "level": "intermediate", "price": 1499, "is_free": False,
                "rating": 4.6, "students_count": 1450,
                "eligibility": "Any Branch", "next_batch_date": BATCH_MAY, "language": "hinglish",
            },
            {
                "title": "API Testing with Postman",
                "description": "Learn REST API testing from scratch. Write Postman collections, scripts, and environment variables. Covers Newman for CI/CD integration and contract testing.",
                "duration_hours": 30, "level": "intermediate", "price": 1299, "is_free": False,
                "rating": 4.7, "students_count": 980,
                "eligibility": "Any Branch", "next_batch_date": BATCH_JUN, "language": "hinglish",
            },
        ],
    },
    {
        "category": "Automation Testing",
        "courses": [
            {
                "title": "Selenium WebDriver with Java",
                "description": "Automate web browsers using Selenium WebDriver and Java. Covers TestNG, Page Object Model, data-driven testing, and integrating with Maven and Jenkins.",
                "duration_hours": 45, "level": "intermediate", "price": 1999, "is_free": False,
                "rating": 4.7, "students_count": 1780,
                "eligibility": "Any Branch", "next_batch_date": BATCH_APR, "language": "hinglish",
            },
            {
                "title": "Cypress End-to-End Testing",
                "description": "Modern web automation with Cypress. Write fast, reliable E2E tests in JavaScript. Covers fixtures, intercepts, component testing, and GitHub Actions integration.",
                "duration_hours": 35, "level": "intermediate", "price": 1799, "is_free": False,
                "rating": 4.8, "students_count": 920,
                "eligibility": "CSE/IT", "next_batch_date": BATCH_MAY, "language": "hinglish",
            },
            {
                "title": "Playwright & Advanced Test Automation",
                "description": "Master Playwright for multi-browser automation. Build a full automation framework with TypeScript, Allure reports, visual regression testing, and BDD with Cucumber.",
                "duration_hours": 50, "level": "advanced", "price": 2499, "is_free": False,
                "rating": 4.9, "students_count": 540,
                "eligibility": "CSE/IT", "next_batch_date": BATCH_JUN, "language": "english",
            },
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed Bihar Skill Hub with all course categories and courses'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.MIGRATE_HEADING('\n🌱 Seeding Bihar Skill Hub courses...\n'))
        total_categories = 0
        total_courses    = 0

        for group in COURSES_DATA:
            cat_name = group['category']
            category, cat_created = Category.objects.get_or_create(
                name=cat_name,
                defaults={'description': f'Courses related to {cat_name}'}
            )
            if cat_created:
                total_categories += 1
                self.stdout.write(f'  ✅ Category created: {cat_name}')
            else:
                self.stdout.write(f'  ↩️  Category exists:  {cat_name}')

            for course_data in group['courses']:
                slug = slugify(course_data['title'])
                base_slug = slug; counter = 1
                while Course.objects.filter(slug=slug).exclude(title=course_data['title']).exists():
                    slug = f'{base_slug}-{counter}'; counter += 1

                course, created = Course.objects.get_or_create(
                    title=course_data['title'],
                    defaults={
                        'slug':            slug,
                        'description':     course_data['description'],
                        'category':        category,
                        'duration_hours':  course_data['duration_hours'],
                        'level':           course_data['level'],
                        'price':           course_data['price'],
                        'is_free':         course_data['is_free'],
                        'rating':          course_data['rating'],
                        'students_count':  course_data['students_count'],
                        'eligibility':     course_data['eligibility'],
                        'next_batch_date': course_data['next_batch_date'],
                        'language':        course_data['language'],
                        'status':          Course.PUBLISHED,
                        'passing_score':   70,
                    }
                )
                if not created:
                    # Update new fields on existing courses
                    Course.objects.filter(pk=course.pk).update(
                        eligibility=course_data['eligibility'],
                        next_batch_date=course_data['next_batch_date'],
                        language=course_data['language'],
                    )
                if created:
                    total_courses += 1
                    free_tag = '🆓' if course_data['is_free'] else f'₹{course_data["price"]}'
                    self.stdout.write(f'     📚 {course_data["title"]} [{course_data["level"]}] {free_tag}')

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Done! Created {total_categories} categories and {total_courses} courses.\n'
        ))