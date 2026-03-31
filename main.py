"""
Future Computer Center – Production Backend
Optimized for Render Deployment & futurecomputer.com
"""

import os
import resend
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

# 1. Load Environment Variables
load_dotenv()

app = FastAPI(title="Future Computer Center API")

# 2. CORS Configuration
# IMPORTANT: When your site is live, replace "*" with "https://futurecomputer.com"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. API Configurations
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

# These should be set in Render's "Environment" tab
# FROM_EMAIL should be: admissions@futurecomputer.com
FROM_EMAIL = os.getenv("FROM_EMAIL", "onboarding@resend.dev")
# YOUR_EMAIL is where you receive the leads
YOUR_EMAIL = os.getenv("YOUR_EMAIL", "frontenddeveloper627@gmail.com")

# Initialize Clients
resend.api_key = RESEND_API_KEY
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

# 4. Data Model
class ContactForm(BaseModel):
    fname: str
    lname: str
    email: EmailStr
    phone: str = ""
    course: str = ""
    message: str

# 5. Helper Functions
def get_course_name(course_id: str) -> str:
    courses = {
        "graphic": "Graphic Design",
        "web": "Web Design (HTML, CSS, JS)",
        "basic": "Basic Computer Course",
        "excel": "Advanced Excel",
        "other": "Other / Not Sure"
    }
    return courses.get(course_id, "General Inquiry")

def generate_ai_summary(form: ContactForm) -> str:
    course_name = get_course_name(form.course)
    prompt = f"""
    Analyze this student inquiry for Future Computer Center:
    Name: {form.fname} {form.lname}
    Interested in: {course_name}
    Student Message: "{form.message}"

    Return a structured summary:
    - PRIORITY: (High/Medium/Low)
    - STUDENT INTENT: (What they want in 2 sentences)
    - SUGGESTED RESPONSE: (Best next step)
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "AI Analysis temporarily unavailable."

# 6. Endpoints
@app.post("/contact")
async def handle_contact(form: ContactForm):
    try:
        # Step A: Get AI Analysis
        ai_summary = generate_ai_summary(form)
        full_name = f"{form.fname} {form.lname}"
        course_name = get_course_name(form.course)
        
        # Step B: Professional Email Template
        email_html = f"""
        <div style="font-family: 'Segoe UI', Helvetica, sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #7b2fff; border-bottom: 2px solid #7b2fff; padding-bottom: 10px;">New Website Inquiry</h2>
            <p><strong>Student Name:</strong> {full_name}</p>
            <p><strong>Email:</strong> {form.email}</p>
            <p><strong>Phone:</strong> {form.phone or 'Not provided'}</p>
            <p><strong>Course:</strong> {course_name}</p>
            
            <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #007bff; font-size: 14px; text-transform: uppercase;">AI Insights (Gemini)</h3>
                <p style="white-space: pre-wrap; font-size: 15px; line-height: 1.6;">{ai_summary}</p>
            </div>

            <h3 style="font-size: 14px; text-transform: uppercase; color: #666;">Original Message:</h3>
            <p style="color: #444; font-style: italic;">"{form.message}"</p>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="font-size: 12px; color: #999;">Sent from futurecomputer.com via Render & Resend API.</p>
        </div>
        """

        # Step C: Send via Resend
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": YOUR_EMAIL,
            "subject": f"🔥 New Lead: {full_name} ({course_name})",
            "html": email_html,
            "reply_to": form.email
        })

        return {"status": "success"}

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/")
def home():
    return {"status": "Backend is live on Render", "info": "Future Computer Center API"}
