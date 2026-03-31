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

# 2. CORS Configuration - Allows your GitHub website to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. API Configurations (Set these in Render Dashboard -> Environment)
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# Use your verified domain email
FROM_EMAIL     = os.getenv("FROM_EMAIL", "onboarding@resend.dev") 
YOUR_EMAIL     = "frontenddeveloper627@gmail.com"

# Initialize Clients
resend.api_key = RESEND_API_KEY
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

class ContactForm(BaseModel):
    fname: str
    lname: str
    email: EmailStr
    phone: str = ""
    course: str = ""
    message: str

# 4. Helper: AI Summary
def generate_ai_summary(form: ContactForm) -> str:
    prompt = f"""
    Analyze this student inquiry for Future Computer Center:
    Student: {form.fname} {form.lname}
    Course: {form.course}
    Message: {form.message}
    
    Provide a 2-sentence summary and a priority level (High/Medium/Low).
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except:
        return "AI Summary unavailable."

# 5. API Endpoints
@app.get("/")
def health_check():
    return {"status": "Backend is live on Render", "info": "Future Computer Center API"}

@app.post("/contact")
async def handle_contact(form: ContactForm):
    try:
        ai_summary = generate_ai_summary(form)
        
        email_html = f"""
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #7b2fff; border-radius: 10px;">
            <h2 style="color: #7b2fff;">New Student Lead</h2>
            <p><strong>Name:</strong> {form.fname} {form.lname}</p>
            <p><strong>Email:</strong> {form.email}</p>
            <p><strong>Course:</strong> {form.course}</p>
            <div style="background: #f4f4f9; padding: 15px; border-radius: 5px; margin: 10px 0;">
                <strong>AI Analysis:</strong><br>{ai_summary}
            </div>
            <hr>
            <p><strong>Message:</strong> {form.message}</p>
        </div>
        """

        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": YOUR_EMAIL,
            "subject": f"🔥 New Lead: {form.fname} ({form.course})",
            "html": email_html,
            "reply_to": form.email
        })

        return {"status": "success"}
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))
