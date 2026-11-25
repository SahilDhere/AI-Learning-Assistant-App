// sahil
import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import officeParser from 'officeparser';
import { extractTextFromPDF } from './pdfParser.js';

export const SUPPORTED_TYPES = ['pdf', 'docx', 'pptx', 'txt', 'md'];

export const getFileType = (filename) =>
    path.extname(filename).slice(1).toLowerCase();

/**
 * Extract plain text from any supported file.
 * @param {string} filePath - disk path of the uploaded file
 * @param {string} type - one of SUPPORTED_TYPES
 * @returns {Promise<{text: string}>}
 */
export const extractText = async (filePath, type) => {
    switch (type) {
        case 'pdf':
            return extractTextFromPDF(filePath);

        case 'docx': {
            const buffer = await fs.readFile(filePath);
            const { value } = await mammoth.extractRawText({ buffer });
            return { text: value };
        }

        case 'pptx': {
            const text = await officeParser.parseOfficeAsync(filePath);
            return { text };
        }

        case 'txt':
        case 'md':
            return { text: await fs.readFile(filePath, 'utf-8') };

        default:
            throw new Error(`Unsupported file type: .${type}`);
    }
};