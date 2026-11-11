import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

const tones = {
  error: { icon: AlertCircle, classes: 'border-danger/40 bg-danger/10 text-red-200', role: 'alert' },
  success: { icon: CheckCircle2, classes: 'border-success/40 bg-success/10 text-green-200', role: 'status' },
  info: { icon: Info, classes: 'border-line bg-surface text-muted', role: 'status' },
  warning: { icon: AlertTriangle, classes: 'border-accent/40 bg-accent/10 text-accent-soft', role: 'status' },
}

// A highlighted message box. Errors use role="alert" so screen readers announce them straight away.
export default function Alert({ tone = 'info', title, children, className = '' }) {
  const { icon: Icon, classes, role } = tones[tone]
  return (
    <div role={role} className={`flex gap-3 rounded-lg border p-4 text-sm leading-relaxed ${classes} ${className}`}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? 'mt-1' : ''}>{children}</div>
      </div>
    </div>
  )
}
