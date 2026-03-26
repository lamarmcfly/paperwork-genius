import type { PermitMapItem } from '@/types/permit'
import { PERMIT_LABELS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

/**
 * Export permits to CSV file
 */
export function exportToCSV(permits: PermitMapItem[], filename = 'permits.csv') {
  const headers = [
    'Address',
    'Permit Type',
    'Project Value',
    'Filing Date',
    'Permit Number',
    'Contractor',
    'Status',
    'Latitude',
    'Longitude',
  ]

  const rows = permits.map((p) => [
    escapeCSV(p.address),
    PERMIT_LABELS[p.permit_type] || p.permit_type,
    p.project_value ? String(p.project_value) : '',
    p.filing_date || '',
    p.permit_number || '',
    escapeCSV(p.contractor_name || ''),
    p.status || '',
    String(p.latitude),
    String(p.longitude),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;')
}

/**
 * Export permits summary report
 */
export function exportSummaryReport(permits: PermitMapItem[]) {
  const totalValue = permits.reduce((sum, p) => sum + (p.project_value || 0), 0)

  const byType = permits.reduce((acc, p) => {
    acc[p.permit_type] = (acc[p.permit_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const report = `
PAPERWORK GENIUS - PERMIT SUMMARY REPORT
Generated: ${new Date().toLocaleString()}
========================================

OVERVIEW
--------
Total Permits: ${permits.length.toLocaleString()}
Total Project Value: ${formatCurrency(totalValue)}

BY PERMIT TYPE
--------------
${Object.entries(byType)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => `${PERMIT_LABELS[type as keyof typeof PERMIT_LABELS] || type}: ${count}`)
  .join('\n')}

TOP 10 BY VALUE
---------------
${permits
  .filter((p) => p.project_value)
  .sort((a, b) => (b.project_value || 0) - (a.project_value || 0))
  .slice(0, 10)
  .map((p, i) => `${i + 1}. ${p.address}\n   ${formatCurrency(p.project_value)} - ${PERMIT_LABELS[p.permit_type]}`)
  .join('\n\n')}

========================================
Data sourced from Miami-Dade County & Shovels.ai
`.trim()

  downloadFile(report, 'permit-summary.txt', 'text/plain;charset=utf-8;')
}

// Helper: Escape CSV special characters and prevent formula injection
function escapeCSV(str: string): string {
  if (!str) return ''

  // Prevent CSV formula injection (DDE attacks)
  // Prefix with single quote if starts with formula characters
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str
  }

  // Escape quotes and wrap in quotes if contains special chars
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes("'")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// Helper: Download file
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
