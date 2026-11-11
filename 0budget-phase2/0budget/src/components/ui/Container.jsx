// Keeps page content centred with consistent side padding.
export default function Container({ as: Tag = 'div', className = '', children }) {
  return <Tag className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>{children}</Tag>
}
