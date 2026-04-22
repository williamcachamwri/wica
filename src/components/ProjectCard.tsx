import type { Project } from '../types'
import { InlineLink } from './InlineLink'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="project-card group">
      <div className="flex items-start gap-4">
        <div className="icon-box">{project.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
            <h3 className="text-lg font-semibold text-text tracking-tight group-hover:text-accent transition-colors duration-300">
              {project.title}
            </h3>
            <span className="text-sm text-muted">{project.tagline}</span>
          </div>
          <p className="text-[15px] leading-relaxed text-text/80 mb-3">
            {project.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {project.links.map((link) => (
              <InlineLink key={link.label} href={link.href}>
                {link.label}
              </InlineLink>
            ))}
            <span className="ml-auto flex gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
/* 94c079dc */
