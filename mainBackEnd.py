import json
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from input import process_input
from uuid import uuid4
from datetime import datetime

import tempfile, shutil, io, os

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
        pdf_bytes = process_input(jsonInput)
        return pdf_bytes
    
        # TempDirectory auto-deletes here
        #return StreamingResponse(
        #    io.BytesIO(pdf_bytes),
        #    media_type="application/pdf",
        #    headers={"Content-Disposition": 'inline; filename="result.pdf"'},
        #)

# -------- Cheatsheets library: save generated PDF and append to public JSON -------- #

# Paths inside the repo to store saved PDFs and list data the frontend reads
PUBLIC_DIR = Path("public")
CHEATS_DIR = PUBLIC_DIR / "cheatsheets"
DATA_FILE = PUBLIC_DIR / "data" / "cheatsheets.json"

# Ensure folders/files exist at startup
CHEATS_DIR.mkdir(parents=True, exist_ok=True)
DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
if not DATA_FILE.exists():
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump([], f, ensure_ascii=False, indent=2)

def _load_cheats() -> list:
    try:
        with DATA_FILE.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def _save_cheats(items: list) -> None:
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

def _next_id(items: list) -> int:
    try:
        return max([int(i.get("id", 0)) for i in items] or [0]) + 1
    except Exception:
        return 1

@app.post("/api/cheatsheets/add")
async def add_cheatsheet(
    title: str = Form(...),
    subject: str = Form(""),
    description: str = Form(""),
    file: UploadFile = File(...),
):
    # Basic PDF validation
    filename = (file.filename or "").lower()
    content_type = (file.content_type or "").lower()
    if not (filename.endswith(".pdf") or content_type == "application/pdf"):
        raise HTTPException(status_code=400, detail="Expected a PDF file")

    # Load, compute next id, and save the file as {id}.pdf under public/cheatsheets
    items = _load_cheats()
    new_id = _next_id(items)
    out_name = f"{new_id}.pdf"
    out_path = CHEATS_DIR / out_name
    with out_path.open("wb") as out:
        shutil.copyfileobj(file.file, out)

    # Path that the frontend can fetch directly (Vite serves /public at root)
    pdf_public_path = f"/cheatsheets/{out_name}"

    new_item = {
        "id": new_id,
        "title": title,
        "subject": subject,
        "description": description,
        "date": datetime.now().date().isoformat(),
        "pathtopdf": pdf_public_path,
    }
    items.append(new_item)
    _save_cheats(items)

    return new_item