const tones = {
  gold: 'border-accent/40 bg-accent/10 text-accent-soft',
  neutral: 'border-line bg-card text-muted',
}

export default function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}
