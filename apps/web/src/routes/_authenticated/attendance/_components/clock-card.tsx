import * as React from 'react'
import { Card, Button, Badge } from '@hris/ui'
import { ClockIcon, SignInIcon, SignOutIcon, MapPinIcon, CheckCircleIcon, WarningCircleIcon, CalendarBlankIcon } from '@phosphor-icons/react'
import type { ITodayAttendance } from '#/libs/api/attendance'

interface ClockCardProps {
  todayData?: ITodayAttendance | null
  onClockIn: (payload: { notes?: string; latitude?: number; longitude?: number }) => Promise<unknown>
  onClockOut: (payload: { notes?: string; latitude?: number; longitude?: number }) => Promise<unknown>
  isClockingIn: boolean
  isClockingOut: boolean
}

export function ClockCard({
  todayData,
  onClockIn,
  onClockOut,
  isClockingIn,
  isClockingOut,
}: ClockCardProps) {
  const [currentTime, setCurrentTime] = React.useState<string>('')
  const [currentDate, setCurrentDate] = React.useState<string>('')
  const [note, setNote] = React.useState<string>('')
  const [geoLoc, setGeoLoc] = React.useState<{ lat?: number; lng?: number } | null>(null)
  const [geoLoading, setGeoLoading] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Realtime clock
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Jakarta',
        }) + ' WIB'
      )
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Jakarta',
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Geolocation fetcher
  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      setGeoLoading(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setGeoLoading(false)
        },
        () => {
          setGeoLoading(false)
        },
        { timeout: 5000 }
      )
    }
  }

  const log = todayData?.log
  const hasClockedIn = Boolean(log?.check_in)
  const hasClockedOut = Boolean(log?.check_out)

  const handleIn = async () => {
    setFeedback(null)
    try {
      await onClockIn({
        notes: note || undefined,
        latitude: geoLoc?.lat,
        longitude: geoLoc?.lng,
      })
      setFeedback({ type: 'success', message: 'Check-in successfully recorded!' })
      setNote('')
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Clock-in failed. Please try again.'
      setFeedback({ type: 'error', message: errorMsg })
    }
  }

  const handleOut = async () => {
    setFeedback(null)
    try {
      await onClockOut({
        notes: note || undefined,
        latitude: geoLoc?.lat,
        longitude: geoLoc?.lng,
      })
      setFeedback({ type: 'success', message: 'Check-out successfully recorded!' })
      setNote('')
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Clock-out failed. Please try again.'
      setFeedback({ type: 'error', message: errorMsg })
    }
  }

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-card/90 via-card/70 to-primary/5 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left: Clock Display & Date */}
        <div className="space-y-2 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <ClockIcon className="h-3.5 w-3.5 animate-pulse" />
            Live Biometric & Shift Attestation
          </div>
          <div className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground font-mono">
            {currentTime || 'Loading...'}
          </div>
          <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground">
            <CalendarBlankIcon className="h-4 w-4" />
            <span>{currentDate}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-muted/60 text-muted-foreground font-medium">
              Schedule: 09:00 - 18:00 WIB
            </span>
          </div>
        </div>

        {/* Center: Shift Status Badge */}
        <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-background/40 border border-border/50 min-w-50">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today's Status</span>
          {!hasClockedIn ? (
            <Badge variant="secondary" className="px-3 py-1 text-xs">
              Not Clocked In
            </Badge>
          ) : hasClockedOut ? (
            <Badge variant="success" className="px-3 py-1 text-xs flex items-center gap-1">
              <CheckCircleIcon className="h-3.5 w-3.5" /> Shift Completed
            </Badge>
          ) : log?.status === 'late' ? (
            <Badge variant="warning" className="px-3 py-1 text-xs flex items-center gap-1">
              <WarningCircleIcon className="h-3.5 w-3.5" /> Late ({log.late_duration_minutes}m)
            </Badge>
          ) : (
            <Badge variant="success" className="px-3 py-1 text-xs flex items-center gap-1">
              <CheckCircleIcon className="h-3.5 w-3.5" /> Active Shift
            </Badge>
          )}

          {hasClockedIn && (
            <div className="text-xs font-mono text-muted-foreground">
              In: {log?.check_in ? new Date(log.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
              {hasClockedOut && ` | Out: ${new Date(log!.check_out!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {!hasClockedIn ? (
            <Button
              onClick={handleIn}
              disabled={isClockingIn}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20 px-6 py-2.5 rounded-xl flex items-center gap-2"
            >
              <SignInIcon className="h-5 w-5" />
              <span>{isClockingIn ? 'Clocking In...' : 'Clock In Now'}</span>
            </Button>
          ) : !hasClockedOut ? (
            <Button
              onClick={handleOut}
              disabled={isClockingOut}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg shadow-amber-600/20 px-6 py-2.5 rounded-xl flex items-center gap-2"
            >
              <SignOutIcon className="h-5 w-5" />
              <span>{isClockingOut ? 'Clocking Out...' : 'Clock Out (Finish Shift)'}</span>
            </Button>
          ) : (
            <div className="text-xs text-emerald-500 font-medium px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              Shift complete for today. See you tomorrow!
            </div>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={handleGetLocation}
            disabled={geoLoading || Boolean(geoLoc)}
            title={geoLoc ? `GPS Locked: ${geoLoc.lat?.toFixed(4)}, ${geoLoc.lng?.toFixed(4)}` : 'Lock GPS Coordinates'}
            className={geoLoc ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : ''}
          >
            <MapPinIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${feedback.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
            }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircleIcon className="h-4 w-4 shrink-0" />
          ) : (
            <WarningCircleIcon className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </Card>
  )
}
