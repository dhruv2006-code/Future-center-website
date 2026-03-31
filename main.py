"""
Future Computer Center – FastAPI Backend
Fixed: Model Naming, Enhanced Error Logging, and Resend Integration
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

app = FastAPI(title="Future Computer Center – Contact API")

# 2. CORS Configuration
# This allows your local HTML file to talk to this Python server
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
# Keep this as onboarding@resend.dev for the free tier!
FROM_EMAIL     = os.getenv("FROM_EMAIL", "onboarding@resend.dev") 
YOUR_EMAIL     = "frontenddeveloper627@gmail.com"

# Initialize Clients
resend.api_key = RESEND_API_KEY
genai.configure(api_key=GEMINI_API_KEY)

# Use the precise model path to avoid 404 errors
model = genai.GenerativeModel("models/gemini-1.5-flash")

# 4. Data Models (Matches your main.js exactly)
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
    """Uses Gemini to summarize the student's request."""
    course_name = get_course_name(form.course)
    prompt = f"""
    You are an admissions assistant for Future Computer Center. 
    Summarize this new student inquiry for the manager.
    
    Student: {form.fname} {form.lname}
    Interested in: {course_name}
    Message: {form.message}
    
    Provide:
    1. Priority Level (High/Medium/Low)
    2. A 2-sentence summary of their needs.
    3. Suggested follow-up action.
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "AI Summary unavailable at the moment."

# 6. API Endpoints
@app.post("/contact")
async def handle_contact(form: ContactForm):
    try:
        # Step A: Get AI Analysis
        ai_summary = generate_ai_summary(form)
        
        # Step B: Prepare Email Content
        full_name = f"{form.fname} {form.lname}"
        course_name = get_course_name(form.course)
        
        email_html = f"""
        <div style="font-family: sans-serif; max-width: 600px; color: #333;">
            <h2 style="color: #7b2fff;">New Student Inquiry</h2>
            <p><strong>From:</strong> {full_name} ({form.email})</p>
            <p><strong>Phone:</strong> {form.phone or 'Not provided'}</p>
            <p><strong>Course:</strong> {course_name}</p>
            <hr />
            <div style="background: #f4f4f9; padding: 15px; border-left: 4px solid #00d4ff;">
                <h3 style="margin-top: 0;">AI Analysis</h3>
                <p style="white-space: pre-wrap;">{ai_summary}</p>
            </div>
            <h3>Original Message:</h3>
            <p>{form.message}</p>
        </div>
        """

        # Step C: Send via Resend
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": YOUR_EMAIL,
            "subject": f"New Lead: {full_name} - {course_name}",
            "html": email_html,
            "reply_to": form.email
        })

        return {"status": "success", "message": "Inquiry sent successfully!"}

    except Exception as e:
        # This will show the EXACT error in your terminal
        print(f"CRITICAL ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def home():
    return {"status": "Backend is online"}