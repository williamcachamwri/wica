import { ProjectCard } from '../components/ProjectCard'
import { SectionDivider } from '../components/SectionDivider'
import { projects } from '../data/projects'

export function Projects() {
  return (
    <section id="projects" className="mb-14">
      <SectionDivider label="Selected work" />
      <div className="space-y-3">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  )
}
/* 928eec8c */
