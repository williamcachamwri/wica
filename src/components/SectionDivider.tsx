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
/* cd251289 */
