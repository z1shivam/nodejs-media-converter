import sys
from pdf2docx import Converter

def convert_pdf_to_docx(pdf_path, docx_path):
    try:
        cv = Converter(pdf_path)
        cv.convert(docx_path)
        cv.close()
        print(f"Successfully converted {pdf_path} to {docx_path}")
        sys.exit(0)
    except Exception as e:
        print(f"Error converting PDF to DOCX: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python converter.py <pdf_path> <docx_path>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    docx_path = sys.argv[2]
    convert_pdf_to_docx(pdf_path, docx_path)
