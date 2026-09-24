import * as React from 'react'
import {
  Button,
  Input,
  FormItem,
  FormLabel,
  FormControl,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@hris/ui'
import { CalendarPlus, X, WarningCircle } from '@phosphor-icons/react'
import type { ILeaveType, SubmitLeavePayload } from '#/libs/api/leave'

interface LeaveRequestModalProps {
  isOpen: boolean
  onClose: () => void
  leaveTypes: ILeaveType[]
  onSubmit: (payload: SubmitLeavePayload) => Promise<unknown>
  isSubmitting: boolean
}

export function LeaveRequestModal({
  isOpen,
  onClose,
  leaveTypes,
  onSubmit,
  isSubmitting,
}: LeaveRequestModalProps) {
  const [leaveTypeId, setLeaveTypeId] = React.useState<string>('')
  const [startDate, setStartDate] = React.useState<string>('')
  const [endDate, setEndDate] = React.useState<string>('')
  const [reason, setReason] = React.useState<string>('')
  const [attachmentUrl, setAttachmentUrl] = React.useState<string>('')
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isOpen && leaveTypes.length > 0 && !leaveTypeId) {
      setLeaveTypeId(leaveTypes[0].id)
    }
  }, [isOpen, leaveTypes, leaveTypeId])

  if (!isOpen) return null

  const selectedType = leaveTypes.find((t) => t.id === leaveTypeId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!leaveTypeId) {
      setError('Please select a leave category.')
      return
    }
    if (!startDate || !endDate) {
      setError('Please provide start and end dates.')
      return
    }
    if (startDate > endDate) {
      setError('Start date cannot be after end date.')
      return
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the leave application.')
      return
    }
    if (selectedType?.requires_attachment && !attachmentUrl.trim()) {
      setError(`Supporting document / URL is required for ${selectedType.name}.`)
      return
    }

    try {
      await onSubmit({
        leave_type_id: leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        reason: reason.trim(),
        attachment_url: attachmentUrl.trim() || undefined,
      })
      onClose()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to submit leave request. Please check your quota.'
      setError(msg)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Submit Leave Application</h2>
              <p className="text-xs text-muted-foreground">Request time off in accordance with Indonesian Labor Law</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
              <WarningCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <FormItem>
            <FormLabel>Leave Category</FormLabel>
            <FormControl>
              <Select value={leaveTypeId} onValueChange={(val) => setLeaveTypeId(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.default_days_per_year > 0 ? `${t.default_days_per_year}d/yr` : 'Flexible'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>

          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </FormControl>
            </FormItem>
          </div>

          <FormItem>
            <FormLabel>Reason / Purpose</FormLabel>
            <FormControl>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Brief explanation of your leave request..."
                required
                className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </FormControl>
          </FormItem>

          {selectedType?.requires_attachment && (
            <FormItem>
              <FormLabel>Supporting Document Link (Doctor's Note / Certificate)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://cloud.storage/medical-note.pdf"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  required={selectedType.requires_attachment}
                />
              </FormControl>
            </FormItem>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground font-semibold px-5">
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
