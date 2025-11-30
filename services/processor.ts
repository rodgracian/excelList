import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RowData, ProcessResult, ProcessingError } from '../types';

const REQUIRED_COLUMNS = [
  "Descripcion",
  "Código de Barras Para Venta",
  "C/P",
  "Precio Regular Derma"
];

/**
 * Reads a generic File object as an ArrayBuffer
 */
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(e.target.result);
      } else {
        reject(new Error("No se pudo leer el archivo físico."));
      }
    };
    reader.onerror = () => reject(new Error("Error de lectura de archivo."));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Processes a single Excel file buffer into the required clean data structure
 * Includes validation for corrupt files and missing columns
 */
const processExcelBuffer = (buffer: ArrayBuffer): RowData[] => {
  let workbook: XLSX.WorkBook;
  
  try {
    workbook = XLSX.read(buffer, { type: 'array' });
  } catch (error) {
    throw new Error("El archivo está corrupto o no es un formato Excel válido.");
  }

  if (!workbook.SheetNames.length) {
    throw new Error("El archivo Excel no contiene hojas de cálculo.");
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Validate Headers
  const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  if (!sheetData || sheetData.length === 0) {
    throw new Error("La hoja de cálculo está vacía.");
  }

  const headers = sheetData[0] as string[];
  const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));

  if (missingColumns.length > 0) {
    throw new Error(`Faltan columnas requeridas: ${missingColumns.join(", ")}`);
  }
  
  // Convert to JSON
  const jsonData: RowData[] = XLSX.utils.sheet_to_json(worksheet);

  // Filter, Transform and Sort
  const processedData = jsonData.map(row => {
    return {
      // Force uppercase to match the visual style of the screenshot
      description: String(row["Descripcion"] || "").trim().toUpperCase(),
      barcode: String(row["Código de Barras Para Venta"] || "").trim(),
      cp: String(row["C/P"] || "").trim(),
      price: "" // Not used in final output
    };
  }).filter(item => item.description !== ""); // Remove empty rows if any

  // Sort: C/P (A-Z) primary, then Description (A-Z) secondary
  processedData.sort((a, b) => {
    // Primary Sort: C/P
    const cpComparison = a.cp.localeCompare(b.cp, 'es', { sensitivity: 'base' });
    if (cpComparison !== 0) return cpComparison;
    
    // Secondary Sort: Description
    return a.description.localeCompare(b.description, 'es', { sensitivity: 'base' });
  });

  return processedData;
};

/**
 * Main function to take multiple files, process them, and generate a single merged PDF
 * Returns a result object containing success counts and specific failures
 */
export const generateMergedPdf = async (files: File[]): Promise<ProcessResult> => {
  if (files.length === 0) throw new Error("No hay archivos para procesar.");

  // Initialize PDF with Letter format (Carta)
  // Unit 'mm' is default but explicit is better for margin calculations
  const doc = new jsPDF({ format: 'letter', unit: 'mm' });
  const failures: ProcessingError[] = [];
  let successCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const data = processExcelBuffer(buffer);

      // Add new page for subsequent files if we have already successfully processed one
      if (successCount > 0) {
        doc.addPage();
      }

      // Generate Table
      autoTable(doc, {
        startY: 10, // Start higher up on the page
        // Match headers from screenshot + new blank column
        head: [['DESCRIPCIÓN', 'SKU', 'P/C', '']], 
        body: data.map(row => [
          row.description,
          row.barcode,
          row.cp,
          '' // Empty column data
        ]),
        theme: 'grid', // Keeps borders
        styles: {
          font: 'helvetica',
          fontSize: 8, 
          minCellHeight: 0, // Allow rows to be as small as possible
          cellPadding: 0.7, // Minimal padding
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0], // Black lines
          lineWidth: 0.1,
          valign: 'middle',
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [255, 255, 255], // White background
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          fontSize: 8,
          minCellHeight: 0, // Allow header to be compact
          cellPadding: 0.7, // Minimal padding
          halign: 'center', // Headers centered
          lineWidth: 0.1,
          lineColor: [0, 0, 0]
        },
        columnStyles: {
          0: { halign: 'left', cellWidth: 'auto' }, // DESCRIPCIÓN (Takes remaining space)
          1: { halign: 'center', cellWidth: 35 },   // SKU (Centered)
          2: { halign: 'center', cellWidth: 15 },   // P/C (Centered)
          3: { halign: 'center', cellWidth: 35 }    // Blank Column (Same width as SKU)
        },
        // Reduced margins to maximize space for rows "to fit on the sheet"
        margin: { top: 10, left: 10, right: 10, bottom: 10 }
      });

      successCount++;

    } catch (error: any) {
      console.error(`Error processing file ${file.name}:`, error);
      failures.push({
        fileName: file.name,
        message: error.message || "Error desconocido durante el procesamiento."
      });
    }
  }

  // Save the final merged PDF if at least one file was successful
  if (successCount > 0) {
    // Save to user's disk
    doc.save("Listas.pdf");
  }

  return { successCount, failures };
};
