import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// CSV Export
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (!data.length) return;

  const headers = columns?.map(c => c.label) || Object.keys(data[0]);
  const keys = columns?.map(c => c.key) || Object.keys(data[0]);

  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      keys.map(key => {
        const value = row[key as keyof T];
        const stringValue = String(value ?? '');
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

// JSON Export
export function exportToJSON<T>(data: T, filename: string, pretty = true) {
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  downloadFile(content, `${filename}.json`, 'application/json');
}

// PDF Export
export function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  options: {
    title?: string;
    columns?: { key: keyof T; label: string; width?: number }[];
    orientation?: 'portrait' | 'landscape';
    pageSize?: 'a4' | 'letter';
  } = {}
) {
  const { title, columns, orientation = 'portrait', pageSize = 'a4' } = options;
  
  const doc = new jsPDF({ orientation, format: pageSize });

  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 20);
  }

  const headers = columns?.map(c => c.label) || Object.keys(data[0] || {});
  const keys = columns?.map(c => c.key) || Object.keys(data[0] || {});

  const tableData = data.map(row =>
    keys.map(key => String(row[key as keyof T] ?? ''))
  );

  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: title ? 30 : 20,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 66, 66] },
  });

  doc.save(`${filename}.pdf`);
}

// Excel-like Export (XLSX format using CSV with BOM)
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (!data.length) return;

  const headers = columns?.map(c => c.label) || Object.keys(data[0]);
  const keys = columns?.map(c => c.key) || Object.keys(data[0]);

  const csvContent = [
    headers.join('\t'),
    ...data.map(row =>
      keys.map(key => String(row[key as keyof T] ?? '')).join('\t')
    )
  ].join('\n');

  // Add BOM for Excel compatibility
  const bom = '\uFEFF';
  downloadFile(bom + csvContent, `${filename}.xls`, 'application/vnd.ms-excel');
}

// Print Table
export function printTable<T extends Record<string, unknown>>(
  data: T[],
  options: {
    title?: string;
    columns?: { key: keyof T; label: string }[];
    styles?: string;
  } = {}
) {
  const { title, columns, styles = '' } = options;
  const headers = columns?.map(c => c.label) || Object.keys(data[0] || {});
  const keys = columns?.map(c => c.key) || Object.keys(data[0] || {});

  const tableHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title || 'Print'}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        @media print { body { padding: 0; } }
        ${styles}
      </style>
    </head>
    <body>
      ${title ? `<h1>${title}</h1>` : ''}
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
          ${data.map(row => `<tr>${keys.map(k => `<td>${row[k as keyof T] ?? ''}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.print();
  }
}

// Helper function
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export hook
import { useCallback } from 'react';

export function useExport<T extends Record<string, unknown>>() {
  const toCSV = useCallback((data: T[], filename: string, columns?: { key: keyof T; label: string }[]) => {
    exportToCSV(data, filename, columns);
  }, []);

  const toJSON = useCallback((data: T, filename: string) => {
    exportToJSON(data, filename);
  }, []);

  const toPDF = useCallback((data: T[], filename: string, options?: Parameters<typeof exportToPDF>[2]) => {
    exportToPDF(data, filename, options);
  }, []);

  const toExcel = useCallback((data: T[], filename: string, columns?: { key: keyof T; label: string }[]) => {
    exportToExcel(data, filename, columns);
  }, []);

  const print = useCallback((data: T[], options?: Parameters<typeof printTable>[1]) => {
    printTable(data, options);
  }, []);

  return { toCSV, toJSON, toPDF, toExcel, print };
}
