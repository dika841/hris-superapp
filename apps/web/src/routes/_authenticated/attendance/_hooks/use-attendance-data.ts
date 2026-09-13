import { useQuery } from '@tanstack/react-query'

export interface AttendanceRecord {
  name: string
  code: string
  date: string
  checkIn: string
  checkOut: string
  status: 'On Time' | 'Late' | 'Annual Leave' | 'Sick Leave'
}

const mockAttendance: AttendanceRecord[] = [
  { name: 'Budi Santoso', code: 'EMP-1001', date: '2026-09-12', checkIn: '08:55', checkOut: '17:45', status: 'On Time' },
  { name: 'Siti Rahma', code: 'EMP-1002', date: '2026-09-12', checkIn: '09:12', checkOut: '18:10', status: 'Late' },
  { name: 'Dewi Lestari', code: 'EMP-1003', date: '2026-09-12', checkIn: '08:45', checkOut: '17:30', status: 'On Time' },
  { name: 'Ahmad Fauzi', code: 'EMP-1004', date: '2026-09-12', checkIn: '-', checkOut: '-', status: 'Annual Leave' },
]

export function useAttendanceData() {
  const query = useQuery({
    queryKey: ['attendance', 'daily-logs'],
    queryFn: async () => mockAttendance,
    initialData: mockAttendance,
  })

  return {
    records: query.data,
    isLoading: query.isLoading,
    stats: {
      presentRate: '96.4%',
      overtimeHours: '124.5 Hrs',
      pendingLeaveRequests: 2,
    },
  }
}
