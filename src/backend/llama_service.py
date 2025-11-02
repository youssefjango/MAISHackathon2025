import json
import requests
from fastapi import FastAPI, HTTPException
from fpdf import FPDF
import os
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
- Choose the most appropriate layout style (CSS Grid or CSS Columns) based on content:
    • If the content is mostly text or tables → use an adaptive multicolumn layout
      with "column-width: 8cm", "column-fill: balance", and "break-inside: avoid".
    • If the content consists of distinct boxes (definitions, examples, exercises) →
      use a clean CSS Grid layout with
      "display: grid; grid-template-columns: repeat(auto-fill, minmax(8cm, 1fr)); grid-gap: 0.5cm;"
      so that boxes align neatly across rows.
- Columns or grid cells must stay balanced and aligned; avoid large empty areas.
- Ensure all text and elements fit within a single A4 page (no overflow).
- Use compact font, tight line spacing (1.15), and small page margins (around 0.5cm).
- Visually distinguish definitions, examples, and exercises using subtle colored boxes.
- For large formulas, tables, or images, use a "full-width" section spanning all columns or grid cells.
- Do NOT use position:absolute or fixed elements; all content must flow naturally.
- Use colors and borders consistently for visual hierarchy and alignment.

Follow these restrictions (user-specified preferences):
{restrictions}

Input Material:
{json.dumps(material, indent=2)}

Output:
Return ONLY valid <html><head><style>...</style></head><body>...</body></html>.
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
@app.post("/generate-cheatsheet")
async def generate(body: dict):
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
