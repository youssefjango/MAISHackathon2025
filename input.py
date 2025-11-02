from pdfminer.high_level import extract_text
from google.cloud import vision
from google import genai
from pathlib import Path
import os
import json
import re

def is_pdf(file) -> bool:
    return file.lower().endswith('.pdf')

def is_image(file) -> bool:
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
    return any(file.lower().endswith(ext) for ext in image_extensions)

def extract_text_from_pdf(pdf_path: Path) -> str:
    
    if not pdf_path.exists() or not is_pdf(pdf_path.name):
        raise ValueError("File is not a valid PDF")
    
    try:
        text = extract_text(str(pdf_path))
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    except Exception as e:
        return ""
    
def pdf_text_to_json(pdf_text: str, output_file: str, restriction: str="") -> str: #returns json filepath
    
    if not pdf_text or not pdf_text.strip():
        summary_data = {
            "text": "",
            "restriction": restriction,
            "error": "Empty input text"
        }
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(summary_data, f, ensure_ascii=False,indent=4)
        return output_file
    
    summary_data = {
        "text": pdf_text,
        "restriction": restriction,
        "error": None
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(summary_data, f, ensure_ascii=False, indent=4)  
    return output_file

def extract_text_from_image(image_path: Path) -> str:

    image_path = Path(image_path).expanduser()

    if not image_path.exists() or not is_image(image_path.name):
        raise ValueError("File is not a valid image")
        
    try:
        client = vision.ImageAnnotatorClient()
        with open(image_path, 'rb') as image_file:
            content = image_file.read()
        
        image = vision.Image(content=content)
        response = client.text_detection(image=image)

        if response.error.message:
            raise RuntimeError(f"Vision API error: {response.error.message}")
        
        full_text = response.full_text_annotation.text if response.full_text_annotation else ""
        return full_text.strip()
    
    except FileNotFoundError:
        raise FileNotFoundError("Image file not found")
    except Exception as e:
        raise RuntimeError(f"Failed to extract text from image: {e}")

def summarize_text(text: str, output_file: str, restriction: str="") -> str: #returns json filepath

    if not text or not text.strip():
        summary_data = {
            "text": "",
            "restriction": restriction,
            "error": "Empty input text"
        }
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(summary_data, f, ensure_ascii=False,indent=4)
        return output_file
    
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    prompt = f"Reformat this text in an organized way, WITHOUT losing any critical information:\n\n{text}"
    summary_data = {"text": "", "restriction": restriction, "error": None}

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        summary = getattr(response, "text", None) or str(response)
        summary = re.sub(r'\s+', ' ', summary).strip()
        summary_data["text"] = summary
    except Exception as e:
        summary_data["error"] = str(e)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(summary_data, f, ensure_ascii=False, indent=4)  
    return output_file

def file_to_summary(file: Path, output_file: str, restriction: str="") -> str: #returns json filepath from summarize_text
    if is_image(str(file)):
        text = extract_text_from_image(file)
    elif is_pdf(str(file)):
        text = extract_text_from_pdf(file)
    else:
        raise ValueError("File must be an image or PDF")
    
    return summarize_text(text, output_file, restriction)

def get_attributes_from_json(json_file: str) -> dict:


    if not Path(json_file).exists():
        raise FileNotFoundError("JSON file not found")
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    return {
        "text": data.get("text", ""),
        "restriction": data.get("restriction", ""),
        "error": data.get("error", None)
    }

def test():
    
    '''
    pdf_path = Path("/Users/sebastianinouye/Desktop/sample.pdf")
    
    try:
        result = extract_text_from_pdf(pdf_path)
        print("\n Extracted Text \n")
        print(result if result else "No text detected")
    except Exception as e:
        print("\nError:", e)
    '''

    '''
    image_path = Path("/Users/sebastianinouye/Desktop/image.png").expanduser()
    
    try:
        result = extract_text_from_image(image_path)
        print("\n Extracted Text \n")
        print(result if result else "No text detected")
    except Exception as e:
        print("\nError:", e)
    '''

    '''
    sample_text = ("Artificial Intelligence (AI) is transforming industries by enabling machines to learn from data, "
                   "adapt to new inputs, and perform tasks that typically require human intelligence. "
                   "From healthcare to finance, AI applications are enhancing decision-making, automating processes, "
                   "and driving innovation across various sectors.")
    output_summary_json = "summary_output.json"
    restriction = "focus on industry applications"

    try:
        summary_json_file = summarize_text(sample_text, output_summary_json, restriction)
        summary_attributes = get_attributes_from_json(summary_json_file)
        print("\nSummary Result:", summary_attributes)
    except Exception as e:
        print("\nSummary Error:", str(e))
    '''
    
    '''
    pdf_path = Path("/Users/sebastianinouye/Desktop/sample.pdf")
    image_path = Path("/Users/sebastianinouye/Desktop/image.png").expanduser()
    output_pdf_json = "image_output.json"
    restriction = "explain connections between concepts"

    try:
        summary = file_to_summary(pdf_path, output_pdf_json, restriction)
        img_summary_attributes = get_attributes_from_json(summary)
        print("Summary from Image:", img_summary_attributes)
    except Exception as e:
        print("Summary from Image Error:", str(e))

    print("\nPDF Testing complete.")

    try:
        summary = file_to_summary(image_path, output_pdf_json, restriction)
        img_summary_attributes = get_attributes_from_json(summary)
        print("Summary from Image:", img_summary_attributes)
    except Exception as e:
        print("Summary from Image Error:", str(e))

    print("\nImage Testing complete.")
    '''

    '''
    pdf_path = Path("/Users/sebastianinouye/Desktop/sample.pdf")
    output_pdf_json = "pdf_output.json"
    restriction = "highlight key points"

    try:
        string_pdf = extract_text_from_pdf(pdf_path)
        print("\n Extracted Text from PDF \n")
        print(string_pdf if string_pdf else "No text detected")
    except Exception as e:
        print("\nError:", e)

    try:
        json_pdf = pdf_text_to_json(string_pdf, output_pdf_json, restriction)
        pdf_attributes = get_attributes_from_json(json_pdf)
        print("\nPDF Text to JSON Result:", pdf_attributes)
    except Exception as e:
        print("\nPDF Text to JSON Error:", str(e))
    '''

def process_input(input_json: str) -> str: #returns json containing json arr & img arr

    with open(input_json, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    filepaths = data.get("files", [])
    restriction = data.get("restriction", "")
    filepaths = [Path(p)for p in filepaths if Path(p).exists()]
    output_files = []
    output_imgs = []

    for filepath in filepaths:
        if is_image(str(filepath)):
            json_output = file_to_summary(filepath, f"{filepath.stem}_summary.json", restriction)
            output_files.append(json_output)
            output_imgs.append(str(filepath))
        elif is_pdf(str(filepath)):
            json_output = file_to_summary(filepath, f"{filepath.stem}_text.json", restriction)
            output_files.append(json_output)
        else:
            continue

    data_output = {
        "json_files": output_files,
        "image_files": output_imgs
    }

    output_json = "processed_output.json"
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(data_output, f, ensure_ascii=False, indent=4)

    with open(output_json, "r", encoding="utf-8") as f:
        result = json.load(f)
    print("Processed Output:", result)

    return output_json

def reformat_output(output_json: str) -> dict: #returns dict with material arr & restriction str
    with open(output_json, "r") as f:
        data = json.load(f)

    result = {
        "material": [],
        "restriction": None
    }

    for json_file in data.get("json_files", []):
        with open(json_file, "r") as jf:
            content = json.load(jf)
            result["material"].append(content.get("text", ""))

            if result["restriction"] is None:
                result["restriction"] = content.get("restriction", "")

    print("Reformatted Output:", result)
    return result

def test_process_input():

    input_data = {
        "files": [
            "/Users/sebastianinouye/Desktop/sample.pdf",
            "/Users/sebastianinouye/Desktop/image.png"
        ],
        "restriction": "summarize key points"
    }
    input_json = "input_test.json"
    with open(input_json, "w", encoding="utf-8") as f:
        json.dump(input_data, f, ensure_ascii=False, indent=4)
    
    output_json = process_input(input_json)
    with open(output_json, "r", encoding="utf-8") as f:
        result = json.load(f)
    
    json_files = result.get("json_files", [])

    for jf in json_files:
        path = Path(jf)
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                content = json.load(f)
            print(f"Content of {jf}:", content)
        else:
            print(f"File {jf} does not exist.")

    print("Processed Output:", result)

    formatted = reformat_output(output_json)
    print("Reformatted Output:", formatted)

#test()
#test_process_input()
