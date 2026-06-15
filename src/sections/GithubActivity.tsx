import { GithubContributions } from '../components/GithubContributions'
import { SectionDivider } from '../components/SectionDivider'

export function GithubActivity() {
  return (
    <section id="github" className="mb-14">
      <SectionDivider label="On GitHub" />
      <GithubContributions />
    </section>
  )
}
