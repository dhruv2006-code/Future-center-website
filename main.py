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
# This allows your GitHub Pages site to talk to your Render backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For max security later, change to ["https://futurecomputer.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. API Configurations (Set these in Render Dashboard -> Environment)
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
FROM_EMAIL     = os.getenv("FROM_EMAIL", "admissions@futurecomputer.com") 
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
    
    Provide:
    1. A 2-sentence professional summary.
    2. Priority Level (High/Medium/Low).
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "AI Summary unavailable."

# 5. API Endpoints
@app.get("/")
def health_check():
    """Tells Render the server is healthy"""
    return {"status": "online", "message": "Future Computer Center Backend is Live"}

@app.post("/contact")
async def handle_contact(form: ContactForm):
    try:
        ai_summary = generate_ai_summary(form)
        
        email_html = f"""
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #7b2fff; border-radius: 10px;">
            <h2 style="color: #7b2fff;">New Student Lead</h2>
            <p><strong>Name:</strong> {form.fname} {form.lname}</p>
            <p><strong>Course:</strong> {form.course}</p>
            <p><strong>Phone:</strong> {form.phone or 'Not provided'}</p>
            <div style="background: #f4f4f9; padding: 10px; border-radius: 5px;">
                <strong>AI Analysis:</strong><br>{ai_summary}
            </div>
            <hr>
            <p><strong>Message:</strong> {form.message}</p>
        </div>
        """

        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": YOUR_EMAIL,
            "subject": f"🔥 New Lead: {form.fname}",
            "html": email_html,
            "reply_to": form.email
        })

        return {"status": "success"}
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
