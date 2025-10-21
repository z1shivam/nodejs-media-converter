# NodeJS File Converter API
This is a backend application written in nodejs which can convert among image formats and can convert pdf to images and pdf to docx.

> 📚 **For detailed technical documentation**, including architecture, challenges faced, and solutions implemented, please see [REPOSITORY_OVERVIEW.md](./REPOSITORY_OVERVIEW.md)

## Prerequisite
1. NodeJS must be installed on your system. You can download it from here - [https://nodejs.org/en/download](https://nodejs.org/en/download).
2. Python must be installed on your system. You can download it from here - [https://www.python.org/downloads/](https://www.python.org/downloads/).
3. `pdf2docx` must be installed on your system. it is a python library which is used to convert pdf to docx. run `pip install pdf2docx` to install this using pip,

## How to setup this project
1. clone this repo on your local machine `git clone https://github.com/z1shivam/nodejs-media-converter.git`.
2. go in the directory `cd nodejs-media-converter`
3. install node_modules using your package manager.
    `npm install` or `pnpm install`.
4. Build the project - `npm run build` or `pnpm run build`.
5. Start the project - `npm run start` or `pnpm run start`.

The server will be running on port 8888 or port specified in environment variable `PORT`.

## Key Features
- ✨ **Wide Format Support**: Convert between 15+ image formats including modern formats like AVIF, WebP, and JPEG XL
- 📄 **PDF Conversion**: Convert PDFs to individual images or editable DOCX documents
- 🔧 **Custom BMP Handling**: Special implementation for BMP format with color channel conversion
- 🚀 **TypeScript**: Type-safe implementation for better maintainability
- 🐍 **Hybrid Architecture**: Combines Node.js performance with Python's PDF processing capabilities
- 🔒 **Robust Validation**: Multi-layer validation for file types and conversion formats

## Endpoints
1. `GET /` -  this is to check if the server is running okay.
2. `POST /img-convert` - the following formats are supported: `jpeg`, `jpg`, `png`, `webp`, `gif`, `avif`, `tiff`, `heic`, `heif`, `jp2`, `jpx`, `j2k`, `j2c`, `jxl`, `bmp`.
request body:
    - body type: form-data
    ```
    {
        uploaded_img : File,
        convertTo : String
    }
    ```
    - response type
    ```
    {
        "success": true,
        "error": null,
        "input_filename": "some.jpg",
        "download_link": "/converted/some_converted.png"
    }
    ```
3. `POST /pdf-convert` - this endpoint convert pdf to images or pdf to docx.
request body:
    - body-type: form-data
    ```
    {
        uploaded_img : File,
        convertTo : String ('images'/'docx')
    }
    ```
    - response-type (pdf to image)
    ```
    {
        "success": true,
        "error": null,
        "input_filename": "50989770463.pdf",
        "download_link": [
            "converted/750989770463-1.jpg"
        ]
    }
    ```
    - response-type (pdf to docx)
    ```
    {
        "success": true,
        "error": null,
        "input_filename": "1750989917931.pdf",
        "download_link": "converted/750989917931.docx"
    }
    ```

## Technical Highlights

### Challenges Overcome
1. **BMP Format Support**: Sharp library doesn't natively support BMP well. Implemented custom converters using `bmp-js` and `pngjs` with manual BGR→RGB color channel conversion.
2. **PDF to DOCX**: No reliable Node.js solution exists. Integrated Python's `pdf2docx` library via child process spawning with cross-platform compatibility.
3. **Type Safety**: Created custom type definitions for libraries lacking TypeScript support.

### Architecture
- **Express.js** for REST API and routing
- **Sharp** for high-performance image processing
- **Multer** for secure file upload handling
- **Python Integration** for specialized PDF processing
- **TypeScript** for type safety and better developer experience

For detailed information about implementation, architecture, and solutions to technical challenges, see [REPOSITORY_OVERVIEW.md](./REPOSITORY_OVERVIEW.md).