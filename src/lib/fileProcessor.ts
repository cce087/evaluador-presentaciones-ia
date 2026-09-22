import * as pdfjsLib from 'pdfjs-dist';
import jszip from 'jszip';
import type { ProcessedSlide } from '../types';

// Use the worker from the same package version
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const MAX_SLIDES = 30;

async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return await file.arrayBuffer();
}

function canvasToBase64(canvas: HTMLCanvasElement): { base64: string; mimeType: string } {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  const base64 = dataUrl.split(',')[1];
  return { base64, mimeType: 'image/jpeg' };
}

async function renderPdfPageToCanvas(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNum: number
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d')!;
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  return canvas;
}

async function processPdf(file: File): Promise<ProcessedSlide[]> {
  const arrayBuffer = await fileToArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = Math.min(pdf.numPages, MAX_SLIDES);
  const slides: ProcessedSlide[] = [];

  for (let i = 1; i <= numPages; i++) {
    const canvas = await renderPdfPageToCanvas(pdf, i);
    const { base64, mimeType } = canvasToBase64(canvas);
    slides.push({ pageNumber: i, base64, mimeType });
  }

  pdf.cleanup();
  return slides;
}

/**
 * PPTX → images approach:
 * PPTX doesn't have direct client-side rendering. We extract media images (PNG/JPG)
 * from the ppt/slides/ and ppt/media/ folders via JSZip. While these are embedded
 * images (not full slide renders), this gives Gemini visual content from the slides.
 */
async function processPptx(file: File): Promise<ProcessedSlide[]> {
  const arrayBuffer = await fileToArrayBuffer(file);
  const zip = await jszip.loadAsync(arrayBuffer);
  const slides: ProcessedSlide[] = [];

  // Collect slide-related media files
  const mediaFiles: Array<{ path: string; blob: Blob }> = [];
  const slideMediaRegex = /^ppt\/media\/(image|media)[\w-]*\.(png|jpe?g|gif|bmp)$/i;

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    if (slideMediaRegex.test(path)) {
      const blob = await entry.async('blob');
      mediaFiles.push({ path, blob });
    }
  }

  // Sort by path for deterministic order
  mediaFiles.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));

  for (let i = 0; i < Math.min(mediaFiles.length, MAX_SLIDES); i++) {
    const { blob } = mediaFiles[i];
    const base64 = await blobToBase64(blob);
    const ext = blob.type || 'image/png';
    slides.push({ pageNumber: i + 1, base64, mimeType: ext });
  }

  return slides;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.txt')) {
    return await file.text();
  }
  if (name.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = Math.min(pdf.numPages, MAX_SLIDES);
    let text = '';
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ('str' in item ? (item as { str: string }).str : ''))
        .join(' ');
      text += pageText + '\n';
    }
    pdf.cleanup();
    return text;
  }
  return '';
}

export async function processFile(file: File): Promise<ProcessedSlide[]> {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.pdf')) {
    return processPdf(file);
  } else if (fileName.endsWith('.pptx')) {
    return processPptx(file);
  } else if (fileName.endsWith('.ppt')) {
    throw new Error(
      'Los archivos .ppt (formato antiguo) no son compatibles. Conviértelo a .pptx o .pdf.'
    );
  } else {
    throw new Error('Formato no compatible. Sube un archivo .pdf o .pptx');
  }
}

export function isSupportedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.pdf') || name.endsWith('.pptx');
}
