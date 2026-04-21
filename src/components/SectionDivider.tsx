interface SectionDividerProps {
  label: string
}

export function SectionDivider({ label }: SectionDividerProps) {
  return (
    <div className="section-divider">
      <span>{label}</span>
    </div>
  )
}
/* 6e1a9eec */
