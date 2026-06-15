interface AnimatedNameProps {
  children: string
  className?: string
  startDelay?: number
}

export function AnimatedName({ children, className = '', startDelay = 0.3 }: AnimatedNameProps) {
  return (
    <span className={`name-letters ${className}`} aria-label={children}>
      {children.split('').map((char, i) => (
        <span
          key={i}
          className="name-letter"
          style={{ animationDelay: `${startDelay + i * 0.055}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}
