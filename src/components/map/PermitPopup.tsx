import { PERMIT_LABELS, PERMIT_COLORS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PermitMapItem } from '@/types/permit'

interface PermitPopupProps {
  permit: PermitMapItem
}

export function PermitPopup({ permit }: PermitPopupProps) {
  return (
    <div className="p-3 min-w-[260px]">
      {/* Permit type badge */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-3 h-3 rounded-full inline-block flex-shrink-0"
          style={{ backgroundColor: PERMIT_COLORS[permit.permit_type] }}
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {PERMIT_LABELS[permit.permit_type] || 'Permit'}
        </span>
      </div>

      {/* Address */}
      <h3 className="font-bold text-sm text-gray-900 mb-3 leading-snug">
        {permit.address}
      </h3>

      {/* Details grid */}
      <div className="space-y-2 text-xs">
        {permit.project_value && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Project Value</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(permit.project_value)}
            </span>
          </div>
        )}

        {permit.description && (
          <div>
            <span className="text-gray-500 block mb-1">Description</span>
            <p className="text-gray-800 leading-relaxed">
              {permit.description}
            </p>
          </div>
        )}

        {permit.filing_date && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Filed</span>
            <span className="text-gray-700">{formatDate(permit.filing_date)}</span>
          </div>
        )}

        {permit.permit_number && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Permit #</span>
            <span className="font-mono text-gray-800 text-xs">
              {permit.permit_number}
            </span>
          </div>
        )}

        {permit.contractor_name && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Contractor</span>
            <span className="text-gray-700 text-right max-w-[160px] truncate">
              {permit.contractor_name}
            </span>
          </div>
        )}

        {permit.status && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Status</span>
            <span className={`font-medium capitalize ${
              permit.status.toLowerCase() === 'approved' ? 'text-green-600' :
              permit.status.toLowerCase() === 'pending' ? 'text-amber-600' :
              permit.status.toLowerCase() === 'completed' ? 'text-blue-600' :
              'text-gray-700'
            }`}>
              {permit.status}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
