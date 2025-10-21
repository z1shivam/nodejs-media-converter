# Repository Overview: NodeJS Media Converter

## Table of Contents
- [What This Repository Does](#what-this-repository-does)
- [Special Features and Implementation Details](#special-features-and-implementation-details)
- [Technical Architecture](#technical-architecture)
- [Challenges Faced and Solutions](#challenges-faced-and-solutions)
- [Key Technologies Used](#key-technologies-used)
- [Project Structure](#project-structure)

---

## What This Repository Does

The **NodeJS Media Converter** is a backend REST API service built with Node.js and TypeScript that provides comprehensive media conversion capabilities. It serves as a powerful tool for converting between various media formats without requiring users to install complex software locally.

### Core Functionalities:

1. **Image Format Conversion**
   - Converts between 15+ image formats including: JPEG, PNG, WebP, GIF, AVIF, TIFF, HEIC, HEIF, JP2, JPX, J2K, J2C, JXL, and BMP
   - Handles modern image formats like AVIF and WebP for web optimization
   - Supports specialized formats like JPEG 2000 (JP2) and JPEG XL (JXL)

2. **PDF to Image Conversion**
   - Converts PDF documents into individual JPEG images
   - Each page of the PDF becomes a separate image file
   - Useful for previewing PDFs or extracting visual content

3. **PDF to DOCX Conversion**
   - Converts PDF documents into editable Microsoft Word (DOCX) format
   - Preserves layout and formatting where possible
   - Enables editing of previously locked PDF content

---

## Special Features and Implementation Details

### 1. Custom BMP Handling

**Problem**: The Sharp library (industry-standard for Node.js image processing) has limited native support for BMP format.

**Solution**: Implemented custom BMP encoding and decoding using `bmp-js` and `pngjs` libraries:
- **BMP to Other Formats**: BMP files are first decoded to raw pixel data, converted to PNG as an intermediate format, then converted to the target format using Sharp
- **Other Formats to BMP**: Files are first converted to PNG using Sharp, then encoded to BMP format using custom pixel manipulation
- **Intermediate Cleanup**: Temporary PNG files are automatically cleaned up after conversion to prevent disk space issues

This approach provides:
- Full BMP support without compromising on quality
- Seamless integration with Sharp's powerful image processing capabilities
- Efficient resource management through temporary file cleanup

### 2. Hybrid Language Architecture (Node.js + Python)

The project uniquely combines Node.js and Python to leverage the best tools from both ecosystems:

**Node.js Components**:
- Primary application server (Express.js)
- Image conversion operations (Sharp library)
- PDF to Image conversion (pdf-poppler)
- Request handling and API endpoints
- File upload management (Multer)

**Python Component**:
- PDF to DOCX conversion using the `pdf2docx` library
- Invoked via child process spawning from Node.js
- Cross-platform command detection (handles both `python` and `python3` commands)

**Inter-process Communication**:
- Node.js spawns Python processes using `child_process.spawn()`
- File paths passed as command-line arguments
- Success/failure communicated through process exit codes
- stdout/stderr captured for debugging

### 3. TypeScript Implementation

The entire codebase is written in TypeScript, providing:
- **Type Safety**: Catch errors at compile-time rather than runtime
- **Better IDE Support**: Enhanced autocomplete and IntelliSense
- **Custom Type Definitions**: Created custom `.d.ts` file for the `pdf-poppler` library which lacks official types
- **Maintainability**: Self-documenting code through type annotations

### 4. Robust File Management System

Implements a three-tier directory structure:
- **uploads/**: Stores original uploaded files temporarily
- **temp/**: Holds intermediate files during conversion (e.g., BMP→PNG→Target)
- **converted/**: Final converted files served to users via static file serving

Subdirectories for organization:
- `converted/images/`: PDF-to-image outputs
- `converted/docx/`: PDF-to-DOCX outputs

### 5. RESTful API Design

Clean, intuitive API endpoints:
- `GET /`: Health check endpoint
- `POST /img-convert`: Image format conversion with multipart form data
- `POST /pdf-convert`: PDF conversion with format selection

Response format consistency:
```json
{
  "success": true/false,
  "error": null or error message,
  "input_filename": "original.jpg",
  "download_link": "/converted/output.png"
}
```

### 6. Advanced Validation

Multi-layer validation system:
- **Multer File Filter**: Pre-upload validation based on MIME types
- **Handler-level Validation**: Validates file presence and format support
- **Controller-level Validation**: Ensures conversion format is supported
- **Error Handling**: Comprehensive try-catch blocks with meaningful error messages

---

## Technical Architecture

### Request Flow Diagram

```
Client Request → Express Middleware → Multer Upload → Handler Validation
                                                              ↓
                     ← Response JSON ← Controller ← Format Selection
                                          ↓
                                    [Conversion Logic]
                                          ↓
                            ┌─────────────┴─────────────┐
                            ↓                           ↓
                      Image Converter            PDF Converter
                      (Sharp + Custom)          (Poppler/Python)
                            ↓                           ↓
                      Converted File              Converted File
                            ↓                           ↓
                      Cleanup Temp ────────────→ Serve via Static
```

### Key Components

1. **Entry Point** (`src/index.ts`)
   - Express server setup
   - Middleware configuration (CORS, JSON, URL-encoded)
   - Route definitions
   - Static file serving for converted files

2. **Handlers** (`src/handlers/`)
   - `imgHandler.ts`: Validates image uploads and conversion parameters
   - `pdfHandler.ts`: Validates PDF uploads and determines conversion type

3. **Controllers** (`src/controllers/`)
   - `img-converter.ts`: Core image conversion logic with BMP special handling
   - `pdf-converter.ts`: PDF conversion using poppler and Python integration

4. **Utilities** (`src/utils/`)
   - `multer.ts`: File upload configuration with type filtering

5. **Constants** (`src/constants/`)
   - Directory paths (converted, uploads, temp)
   - Supported formats list
   - Python script path

6. **Python Integration** (`python/`)
   - `pdf-to-docx.py`: Standalone script for PDF to DOCX conversion

---

## Challenges Faced and Solutions

### Challenge 1: BMP Format Compatibility
**Problem**: Sharp library doesn't provide robust BMP format support. Direct BMP conversions would fail or produce corrupted files.

**Investigation**: 
- Sharp primarily focuses on modern, web-optimized formats
- BMP is a legacy format with different data structure (BGR instead of RGB)
- Direct encoding/decoding would require native library modifications

**Solution**:
- Implemented custom conversion pipeline using `bmp-js` for decoding and `pngjs` for encoding
- Used PNG as an intermediate format (universally supported by Sharp)
- Created separate functions: `convertBMPtoPNG()` and `convertToBMP()`
- Handled pixel channel reordering (BGR ↔ RGB) manually
- Implemented robust cleanup of temporary files in finally blocks

**Code Snippet**:
```typescript
// BMP uses BGR, need to convert to RGB
for (let i = 0; i < data.length; i += 4) {
    rgbaData[i] = data[i + 2];     // R
    rgbaData[i + 1] = data[i + 1]; // G
    rgbaData[i + 2] = data[i];     // B
    rgbaData[i + 3] = data[i + 3]; // A
}
```

### Challenge 2: Python Integration for PDF to DOCX
**Problem**: No reliable Node.js library exists for PDF to DOCX conversion with good layout preservation. The `pdf2docx` Python library is the best available solution.

**Investigation**:
- Evaluated pure Node.js solutions (limited capabilities)
- Explored pdf2json and similar libraries (poor formatting retention)
- Found `pdf2docx` Python library offers superior results

**Solution**:
- Created hybrid architecture with Node.js as primary and Python as subprocess
- Implemented cross-platform Python command detection:
  ```typescript
  const pythonCommand = process.platform === "win32" ? "python" : "python3";
  ```
- Used `child_process.spawn()` for non-blocking execution
- Captured stdout/stderr for debugging
- Implemented Promise-based wrapper for async/await compatibility
- Exit code determines success/failure

**Advantages**:
- Leverages best tool for the job
- Node.js handles web serving, Python handles specialized conversion
- Clean separation of concerns

### Challenge 3: Missing Type Definitions
**Problem**: The `pdf-poppler` npm package lacks TypeScript type definitions, causing compilation errors.

**Solution**:
- Created custom type declaration file: `types/pdf-poppler.d.ts`
- Configured TypeScript to include custom types directory in `tsconfig.json`:
  ```json
  "typeRoots": ["./node_modules/@types", "./types"]
  ```
- Used module declaration to satisfy TypeScript compiler
- Allows flexible usage while maintaining type safety elsewhere

### Challenge 4: File and Path Management
**Problem**: Managing uploaded files, temporary intermediate files, and converted outputs without conflicts or resource leaks.

**Investigation**:
- Risk of filename collisions with concurrent requests
- Need for cleanup of temporary files
- Cross-platform path handling (Windows vs Unix)

**Solution**:
- Unique filename generation using timestamp: `originalname-${Date.now()}.ext`
- Three-tier directory structure for organization
- Path resolution using `path.resolve()` for cross-platform compatibility
- Automatic directory creation with `{recursive: true}` option
- Cleanup in `finally` blocks to ensure temp files are deleted even on errors
- Static file serving from `converted/` directory for easy download access

### Challenge 5: Filename Sanitization
**Problem**: User-uploaded filenames could contain spaces or special characters causing issues in file paths and URLs.

**Solution**:
- Replaced spaces with hyphens: `filename.replace(/\s+/g, "-")`
- Sanitized filenames in multiple locations:
  - During upload (Multer storage configuration)
  - During conversion (output filename generation)
  - In PDF converter (prefix generation)

**Example**:
```typescript
const originalFilename = path
    .basename(inputFilePath, path.extname(inputFilePath))
    .replace(/\s+/g, "-");
```

### Challenge 6: Error Handling and User Feedback
**Problem**: Providing meaningful error messages while preventing sensitive system information exposure.

**Solution**:
- Multi-layer validation with specific error messages
- HTTP status codes reflecting error types (400 for client errors, 500 for server errors)
- Structured error responses matching success responses
- Console logging for debugging without exposing to users
- Try-catch blocks at strategic points

**Response Structure**:
```typescript
{
    success: false,
    error: "User-friendly error message"
}
```

---

## Key Technologies Used

### Core Dependencies

1. **Express.js (v5.1.0)**
   - Modern web framework for Node.js
   - Middleware support for modular architecture
   - Static file serving for downloads

2. **Sharp (v0.34.2)**
   - High-performance image processing library
   - Supports modern formats (AVIF, WebP, JXL)
   - Built on libvips (faster than ImageMagick)

3. **Multer (v2.0.1)**
   - Middleware for handling multipart/form-data
   - Configurable storage and file filtering
   - Automatic file management

4. **pdf-poppler (v0.2.1)**
   - Node.js wrapper for poppler-utils
   - Converts PDF pages to images
   - Requires poppler installed on system

5. **bmp-js (v0.1.0)**
   - BMP format encoder/decoder
   - Provides raw pixel data access
   - Essential for BMP conversion workaround

6. **pngjs (v7.0.0)**
   - Pure JavaScript PNG encoder/decoder
   - Works with raw pixel buffers
   - Complements bmp-js for format bridging

7. **CORS (v2.8.5)**
   - Enables cross-origin resource sharing
   - Allows frontend apps to consume the API

### Development Dependencies

1. **TypeScript (v5.8.3)**
   - Adds static typing to JavaScript
   - Improves code quality and maintainability

2. **@types/* packages**
   - Type definitions for JavaScript libraries
   - Enables TypeScript intellisense

3. **ts-node (v10.9.2)**
   - TypeScript execution without pre-compilation
   - Useful for development and testing

### External Dependencies

1. **Python (3.x)**
   - Required for PDF to DOCX conversion
   - Must be installed on system

2. **pdf2docx (Python library)**
   - Python package for PDF to DOCX conversion
   - Installed via pip: `pip install pdf2docx`

3. **Poppler Utils**
   - Command-line PDF utilities
   - Required by pdf-poppler Node.js package

---

## Project Structure

```
nodejs-media-converter/
├── src/                          # TypeScript source code
│   ├── index.ts                  # Application entry point
│   ├── constants/
│   │   └── index.ts              # Constants (paths, formats, port)
│   ├── controllers/
│   │   ├── img-converter.ts      # Image conversion logic
│   │   └── pdf-converter.ts      # PDF conversion logic
│   ├── handlers/
│   │   ├── imgHandler.ts         # Image upload handler & validation
│   │   └── pdfHandler.ts         # PDF upload handler & validation
│   └── utils/
│       └── multer.ts             # Multer upload configuration
├── python/
│   └── pdf-to-docx.py            # Python script for PDF→DOCX
├── types/
│   └── pdf-poppler.d.ts          # Custom type definitions
├── dist/                         # Compiled JavaScript (generated)
├── uploads/                      # Temporary uploaded files (gitignored)
├── temp/                         # Intermediate conversion files (gitignored)
├── converted/                    # Final converted files (gitignored)
│   ├── images/                   # PDF to image outputs
│   └── docx/                     # PDF to DOCX outputs
├── package.json                  # Node.js dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # Basic usage documentation
└── REPOSITORY_OVERVIEW.md        # This file (detailed documentation)
```

### Design Patterns Used

1. **MVC-like Architecture**
   - Handlers: Request validation (Controller layer)
   - Controllers: Business logic (Model layer)
   - Express Routes: Routing layer

2. **Dependency Injection**
   - Multer middleware injected into routes
   - Configurable storage and filters

3. **Factory Pattern**
   - Different converters based on format
   - Conditional logic for BMP handling

4. **Strategy Pattern**
   - Different conversion strategies based on input/output formats
   - BMP requires special handling strategy

---

## Development Workflow

### Prerequisites Installation
```bash
# Install Node.js dependencies
npm install

# Install Python dependency
pip install pdf2docx
```

### Build and Run
```bash
# Compile TypeScript to JavaScript
npm run build

# Start the server
npm run start
```

### Testing Conversions

**Image Conversion**:
```bash
curl -X POST http://localhost:8888/img-convert \
  -F "uploaded_img=@image.jpg" \
  -F "convertTo=png"
```

**PDF to Images**:
```bash
curl -X POST http://localhost:8888/pdf-convert \
  -F "uploaded_pdf=@document.pdf" \
  -F "convertTo=images"
```

**PDF to DOCX**:
```bash
curl -X POST http://localhost:8888/pdf-convert \
  -F "uploaded_pdf=@document.pdf" \
  -F "convertTo=docx"
```

---

## Future Enhancement Possibilities

1. **Additional Format Support**
   - Video format conversions (MP4, AVI, MKV)
   - Audio format conversions (MP3, WAV, FLAC)
   - Document formats (DOC, RTF, ODT)

2. **Advanced Image Processing**
   - Resize and crop operations
   - Watermarking
   - Batch conversions

3. **Quality and Compression Options**
   - User-configurable quality levels
   - Lossless vs lossy compression choice

4. **Job Queue System**
   - Handle large files asynchronously
   - Progress tracking for long conversions
   - Redis/Bull queue integration

5. **Cloud Storage Integration**
   - S3 or Google Cloud Storage for converted files
   - Automatic cleanup after expiration

6. **User Authentication**
   - Rate limiting per user
   - Conversion history
   - Premium tiers

7. **Web Interface**
   - Drag-and-drop file upload
   - Real-time conversion progress
   - Download management

---

## Conclusion

The NodeJS Media Converter demonstrates how to build a production-ready file conversion service by:
- Combining multiple technologies (Node.js, TypeScript, Python)
- Solving real-world compatibility challenges (BMP format)
- Implementing robust error handling and validation
- Managing resources efficiently (temporary files, memory)
- Providing a clean API interface

The challenges overcome in this project showcase problem-solving skills, including working around library limitations, integrating multiple programming languages, and implementing custom solutions when existing tools fall short.

This repository serves as both a functional media conversion service and a learning resource for building complex Node.js applications with TypeScript, handling file uploads, processing media files, and integrating external tools and libraries.
