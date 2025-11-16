import Tesseract from 'tesseract.js';

export const processImageOCR = async (imagePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'spa', { logger: m => {} });
    const normalized = text.replace(/\s+/g,' ').replace(/,/g,'.');
    // try find S/ 10, 10.00, 10
    const regex = /(?:S\/?\.?\s*)?(10(?:\.0{1,2})?)(?:\b|\s|PEN|soles?)/i;
    const m = normalized.match(regex);
    if (m) return { monto: parseFloat(m[1]), estado: 'revision', confianza: 'alta' };
    // find any number close to 10
    const nums = normalized.match(/\d+(?:\.\d+)?/g);
    if (nums) {
      for (const n of nums) {
        if (Math.abs(parseFloat(n) - 10.0) < 0.1) return { monto: 10.0, estado: 'revision', confianza:'media' };
      }
    }
    return { monto: null, estado: 'revision', confianza: 'baja' };
  } catch(err) {
    console.error('OCR error', err);
    return { monto: null, estado: 'revision', confianza: 'error' };
  }
};
