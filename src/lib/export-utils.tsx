import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ============================================
// DATA EXPORT UTILITIES
// Exportação para CSV, Excel, PDF, JSON
// ============================================

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: (value: unknown) => string;
}

export interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
  dateRange?: { start: Date; end: Date };
}

// ============================================
// CSV EXPORT
// ============================================

export function exportToCSV({ filename, columns, data }: ExportOptions): void {
  const headers = columns.map((col) => col.header);
  
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.key];
      const formatted = col.format ? col.format(value) : String(value ?? "");
      // Escape quotes and wrap in quotes if contains comma
      if (formatted.includes(",") || formatted.includes('"') || formatted.includes("\n")) {
        return `"${formatted.replace(/"/g, '""')}"`;
      }
      return formatted;
    })
  );

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Add BOM for Excel UTF-8 compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

// ============================================
// JSON EXPORT
// ============================================

export function exportToJSON({ filename, data }: Pick<ExportOptions, "filename" | "data">): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  downloadBlob(blob, `${filename}.json`);
}

// ============================================
// PDF EXPORT
// ============================================

export function exportToPDF({ filename, title, subtitle, columns, data, dateRange }: ExportOptions): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  let yPos = 20;

  if (title) {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, yPos, { align: "center" });
    yPos += 10;
  }

  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(subtitle, pageWidth / 2, yPos, { align: "center" });
    yPos += 8;
  }

  if (dateRange) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateText = `Período: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
    doc.text(dateText, pageWidth / 2, yPos, { align: "center" });
    yPos += 8;
  }

  // Generated date
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Gerado em: ${formatDateTime(new Date())}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  // Table
  const headers = columns.map((col) => col.header);
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.key];
      return col.format ? col.format(value) : String(value ?? "");
    })
  );

  autoTable(doc, {
    startY: yPos,
    head: [headers],
    body: rows,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width };
      }
      return acc;
    }, {} as Record<number, { cellWidth: number }>),
  });

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`${filename}.pdf`);
}

// ============================================
// EXCEL-LIKE EXPORT (XLSX via CSV)
// ============================================

export function exportToExcel({ filename, columns, data }: ExportOptions): void {
  // For true XLSX, would need xlsx library
  // This creates a CSV that Excel can open
  const headers = columns.map((col) => col.header);
  
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.key];
      const formatted = col.format ? col.format(value) : String(value ?? "");
      // Tab-separated for Excel
      return formatted.replace(/\t/g, " ");
    })
  );

  const content = [
    headers.join("\t"),
    ...rows.map((row) => row.join("\t")),
  ].join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + content], { type: "application/vnd.ms-excel" });
  downloadBlob(blob, `${filename}.xls`);
}

// ============================================
// PRINT EXPORT
// ============================================

export function printData({ title, subtitle, columns, data, dateRange }: Omit<ExportOptions, "filename">): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title || "Relatório"}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; margin-bottom: 5px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 10px; }
        .date-range { text-align: center; color: #888; font-size: 12px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #3b82f6; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background: #f5f7fa; }
        .footer { text-align: center; color: #888; font-size: 10px; margin-top: 20px; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      ${title ? `<h1>${title}</h1>` : ""}
      ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}
      ${dateRange ? `<p class="date-range">Período: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}</p>` : ""}
      <table>
        <thead>
          <tr>${columns.map((col) => `<th>${col.header}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${data.map((row) => `
            <tr>
              ${columns.map((col) => {
                const value = row[col.key];
                const formatted = col.format ? col.format(value) : String(value ?? "");
                return `<td>${formatted}</td>`;
              }).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
      <p class="footer">Gerado em: ${formatDateTime(new Date())}</p>
      <button onclick="window.print()" style="margin: 20px auto; display: block; padding: 10px 20px; cursor: pointer;">
        Imprimir
      </button>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("pt-BR");
}

// ============================================
// COMMON FORMATTERS
// ============================================

export const formatters = {
  currency: (value: unknown) => {
    const num = Number(value);
    return isNaN(num) ? "-" : num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },
  
  percentage: (value: unknown) => {
    const num = Number(value);
    return isNaN(num) ? "-" : `${num.toFixed(1)}%`;
  },
  
  number: (value: unknown) => {
    const num = Number(value);
    return isNaN(num) ? "-" : num.toLocaleString("pt-BR");
  },
  
  date: (value: unknown) => {
    if (!value) return "-";
    const date = new Date(value as string);
    return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("pt-BR");
  },
  
  datetime: (value: unknown) => {
    if (!value) return "-";
    const date = new Date(value as string);
    return isNaN(date.getTime()) ? "-" : date.toLocaleString("pt-BR");
  },
  
  boolean: (value: unknown) => (value ? "Sim" : "Não"),
  
  status: (statusMap: Record<string, string>) => (value: unknown) => {
    return statusMap[String(value)] || String(value);
  },
};

// ============================================
// EXPORT DROPDOWN COMPONENT
// ============================================

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, FileJson, Printer } from "lucide-react";

interface ExportDropdownProps {
  options: ExportOptions;
  disabled?: boolean;
}

export function ExportDropdown({ options, disabled }: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportToCSV(options)}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToExcel(options)}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToPDF(options)}>
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToJSON(options)}>
          <FileJson className="mr-2 h-4 w-4" />
          JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => printData(options)}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
