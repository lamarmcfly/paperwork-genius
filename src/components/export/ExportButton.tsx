import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { exportToCSV, exportSummaryReport } from '@/lib/export'
import { useToast } from '@/components/ui/toast'
import type { PermitMapItem } from '@/types/permit'

interface ExportButtonProps {
  permits: PermitMapItem[]
}

export function ExportButton({ permits }: ExportButtonProps) {
  const { toast } = useToast()

  const handleExportCSV = () => {
    if (permits.length === 0) {
      toast('No permits to export', 'error')
      return
    }

    const filename = `permits-${new Date().toISOString().split('T')[0]}.csv`
    exportToCSV(permits, filename)
    toast(`Exported ${permits.length} permits to CSV`, 'success')
  }

  const handleExportSummary = () => {
    if (permits.length === 0) {
      toast('No permits to export', 'error')
      return
    }

    exportSummaryReport(permits)
    toast('Summary report downloaded', 'success')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportSummary}>
          <FileText className="w-4 h-4 mr-2" />
          Summary Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
