export interface AttendanceRecordUI {
  id: string
  name: string
  code: string
  department: string
  date: string
  checkIn: string
  checkOut: string
  status: 'On Time' | 'Late' | 'Early Departure' | 'Absent' | 'Leave'
  lateMinutes: number
  overtimeMinutes: number
  notes: string
  autoClosed: boolean
}

export function mapStatusToUI(status: string): AttendanceRecordUI['status'] {
  switch (status.toLowerCase()) {
    case 'present':
      return 'On Time'
    case 'late':
      return 'Late'
    case 'early_departure':
      return 'Early Departure'
    case 'absent':
      return 'Absent'
    case 'leave':
      return 'Leave'
    default:
      return 'On Time'
  }
}

export function formatTimeString(isoString?: string | null): string {
  if (!isoString) return '-'
  try {
    const d = new Date(isoString)
    return (
      d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta',
      }) + ' WIB'
    )
  } catch {
    return '-'
  }
}
