import { pdfjs } from 'react-pdf';

// Ensure PDF.js worker is properly initialized
const configurePdfWorker = () => {
  try {
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
      console.log(`Setting PDF.js worker URL to: ${workerUrl}`);
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    }
  } catch (err) {
    console.error('Failed to configure PDF worker:', err);
  }
};

/**
 * Extract text from a PDF file
 * @param {File} file - The PDF file object
 * @returns {Promise<string>} - The extracted text
 */
export const extractTextFromPdf = async (file) => {
  try {
    console.log(`Starting PDF extraction for file: ${file.name} (${file.size} bytes)`);
    configurePdfWorker();
    
    // Convert file to array buffer
    const buffer = await readFileAsArrayBuffer(file);
    console.log(`File converted to ArrayBuffer of ${buffer.byteLength} bytes`);
    
    // Load the document with more explicit options
    const loadingTask = pdfjs.getDocument({
      data: buffer,
      nativeImageDecoderSupport: 'none',
      ignoreErrors: true
    });
    
    console.log('PDF loading task created, waiting for document...');
    const pdf = await loadingTask.promise;
    
    console.log(`PDF loaded successfully. Page count: ${pdf.numPages}`);
    
    // Extract text from each page
    let extractedText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${pdf.numPages}`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      extractedText += pageText + " ";
    }
    
    const result = extractedText.trim();
    console.log(`Extraction complete. Extracted ${result.length} characters`);
    return result;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Helper function to read a File as ArrayBuffer
 */
const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        resolve(event.target.result);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Fallback method using a different approach
 */
export const extractTextFromPdfFallback = async (file) => {
  try {
    console.log('Using fallback PDF extraction method');
    configurePdfWorker();
    
    // Read file as text directly (simpler approach that might work in some cases)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          // Try to extract plain text if possible
          const text = event.target.result;
          if (text && typeof text === 'string') {
            const cleanedText = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
              
            if (cleanedText.length > 0) {
              console.log(`Fallback extracted ${cleanedText.length} characters`);
              resolve(cleanedText);
            } else {
              reject(new Error('No text content found'));
            }
          } else {
            reject(new Error('Invalid text content type'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('Fallback PDF extraction error:', error);
    throw new Error('Could not extract text using fallback method');
  }
};

// Direct text extraction - last resort
export const extractRawText = async (file) => {
  console.log('Attempting direct text extraction');
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = function() {
        try {
          const content = reader.result;
          // Extract any text-like content
          const text = content.toString().replace(/[^\x20-\x7E\n\r\t]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          console.log(`Raw text extraction found ${text.length} characters`);
          resolve(text.length > 0 ? text : "Could not extract meaningful text");
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  extractTextFromPdf,
  extractTextFromPdfFallback,
  extractRawText
};