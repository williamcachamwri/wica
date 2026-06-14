interface AnimatedNameProps {
  children: string
  className?: string
}

export function AnimatedName({ children, className = '' }: AnimatedNameProps) {
  return (
    <span className={`name-letters ${className}`} aria-label={children}>
      {children.split('').map((char, i) => (
        <span
          key={i}
          className="name-letter"
          style={{ animationDelay: `${0.3 + i * 0.055}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}
