import json
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from input import process_input

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