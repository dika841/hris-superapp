import { Card, CardContent, CardHeader, CardTitle, Badge } from '@hris/ui'
import { CalendarCheck, Heartbeat, Baby, Confetti, Handshake } from '@phosphor-icons/react'
import type { ILeaveBalance } from '#/libs/api/leave'

interface LeaveBalancesCardProps {
  balances: ILeaveBalance[]
}

function getLeaveIcon(code: string) {
  switch (code.toUpperCase()) {
    case 'ANNUAL':
      return <CalendarCheck className="h-5 w-5 text-emerald-500" />
    case 'SICK':
      return <Heartbeat className="h-5 w-5 text-rose-500" />
    case 'MATERNITY':
      return <Baby className="h-5 w-5 text-purple-500" />
    case 'MARRIAGE':
      return <Confetti className="h-5 w-5 text-amber-500" />
    default:
      return <Handshake className="h-5 w-5 text-primary" />
  }
}

export function LeaveBalancesCard({ balances }: LeaveBalancesCardProps) {
  if (balances.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No leave quotas allocated yet for this year.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {balances.map((b) => (
        <Card key={b.id} className="glass-panel glass-panel-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {b.leave_type_name}
              </CardTitle>
              <span className="text-[11px] font-mono text-muted-foreground/80">
                {b.is_paid ? 'Paid Leave' : 'Unpaid'}
              </span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-card/80 border border-border flex items-center justify-center">
              {getLeaveIcon(b.leave_type_code)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-foreground font-mono">
                {b.remaining_days}
                <span className="text-xs font-normal text-muted-foreground ml-1">days left</span>
              </div>
              {b.pending_days > 0 && (
                <Badge variant="warning" className="text-[10px]">
                  {b.pending_days} pending
                </Badge>
              )}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/40 pt-2 font-mono">
              <span>Allocated: {b.allocated_days}d</span>
              <span>Used: {b.used_days}d</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
