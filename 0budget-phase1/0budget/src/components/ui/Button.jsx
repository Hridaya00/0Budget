import { Link } from 'react-router-dom'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

const variants = {
  primary: 'bg-accent text-ink hover:bg-accent-soft hover:-translate-y-0.5 shadow-lg shadow-accent/10',
  secondary: 'border border-line bg-card/60 text-fg hover:border-accent hover:text-accent-soft',
  ghost: 'text-muted hover:text-fg',
}

const sizes = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

// Renders a router <Link> when "to" is given, otherwise a normal <button>.
export default function Button({ to, variant = 'primary', size = 'md', className = '', children, ...props }) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
