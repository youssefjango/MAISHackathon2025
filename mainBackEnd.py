import json
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from input import process_input , reformat_output
import requests
from src.backend.llama_service import generate
import tempfile, shutil, io, os
from fpdf import FPDF
import textwrap
from markdown import markdown
from weasyprint import HTML
import google.generativeai as genai


app = FastAPI()


OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_cheatsheet(input_data: dict) -> str:
    material = input_data.get("material", [])
    restrictions = input_data.get("restriction", "")

    if not material:
        raise HTTPException(status_code=400, detail="No material provided")

    prompt = f"""
You are a professional layout designer for academic cheat sheets.
Generate a complete, print-ready HTML document with inline CSS.

Requirements:
Choose the most appropriate layout style (CSS Grid or CSS Columns, floats or flexbox) based on content:
Prioritize readability
Ensure no overflowing content that gets cut off.
Use small page margins (around 0.5cm) and make sure the content is aligned with the marginsc.
Visually distinguish definitions, examples, and exercises using subtle colored boxes.
all content must flow naturally.
Use colors and borders consistently for visual hierarchy and alignment.

Follow these IMPORTANT restrictions (user-specified preferences) and prioritize page numbers:
{restrictions}

Input Material:
{json.dumps(material, indent=2)}

Output:
Return ONLY valid markdown language starting with <html.
Do not include markdown fences or explanations.
"""





    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.5-flash")

        print("Getting response")
        response = model.generate_content(prompt)
        html_doc = response.text.strip()

        import re
        html_doc = re.sub(r"^\s*```(?:html)?\s*", "", html_doc)
        html_doc = re.sub(r"\s*```$", "", html_doc).strip()
        match = re.search(r"<html[\s\S]*", html_doc, flags=re.IGNORECASE)
        if match:
            html_doc = match.group(0).strip()

        if not html_doc.startswith("<html"):
            print(html_doc[:1500])  # print first ~1500 chars for readability

            raise HTTPException(status_code=500, detail="Gemini did not return valid HTML")

        return html_doc

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {e}")


def generate_dynamic_css_from_restrictions(restrictions: str, material: list = None) -> str:
    prompt = f"""
Generate a full CSS theme (no explanations) for an academic cheat sheet with the following intent:
{restrictions}

Use professional colors, readable fonts, and support one- or two-column layouts.
"""

    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return response.text.strip()




def create_pdf_from_html(html_content, filename):
    output_path = os.path.join(OUTPUT_DIR, filename)
    HTML(string=html_content, base_url=os.getcwd()).write_pdf(output_path)
    return output_path

# -------------------------------
# FastAPI endpoint
# -------------------------------
#@app.post("/generate-cheatsheet")
def generate(body: dict):
    
    try:
        material = body.get("material", [])
        restrictions = body.get("restriction", "")

        # Step 1: Generate full HTML from model
        input_data = {"material": material, "restriction": restrictions}
        html_doc = generate_cheatsheet(input_data)

        # Step 2: Save to PDF
        filename = f"cheatsheet_{int(os.times()[4]*1000)}.pdf"
        path = create_pdf_from_html(html_doc, filename)

        output = {"pdf_url": path, "html_preview": html_doc[:1000] + "..."}
        print(output)
        return output
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.post("/generate-pdf")
async def generate_pdf(
    restrictions: str = Form(...),
    files: List[UploadFile] = File(...),   # combined PDFs + images
):
    if len(files) == 0:
        raise HTTPException(400, "At least one file is required.")

    # Create a temp directory for this request
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = Path(tmpdir)
        saved_paths: List[Path] = []

        # Persist each upload to a unique temp file (Windows-safe)
        for f in files:
            # Keep only the extension; ignore any path parts for security
            suffix = Path(f.filename).suffix
            # Create a unique filename in the temp dir
            dst = tmpdir_path / (next(tempfile._get_candidate_names()) + suffix)
            with dst.open("wb") as out:
                # Stream copy to avoid loading whole file in memory
                shutil.copyfileobj(f.file, out)
            saved_paths.append(dst)

        jsonInput = "inputStudentDetails.json"
        with open(jsonInput, "w", encoding="utf-8") as f:
            json.dump({"files": [str(p) for p in saved_paths], "restriction": restrictions}, f, ensure_ascii=False, indent=4)

        # Run your path-based processing
        processed_files = process_input(jsonInput)
        reformatted = reformat_output(processed_files)
        response = generate(reformatted)

        file_path = response.get("pdf_url")
        print("Generated PDF path:", file_path)

        return FileResponse(
            path=file_path, 
            media_type="application/pdf", 
            filename="result.pdf"
        )
    
        # TempDirectory auto-deletes here
        #return StreamingResponse(
        #    io.BytesIO(pdf_bytes),
        #    media_type="application/pdf",
        #    headers={"Content-Disposition": 'inline; filename="result.pdf"'},
        #)