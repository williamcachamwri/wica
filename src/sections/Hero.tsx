import { Link } from 'react-router-dom'
import { CyclingTypewriter } from '../components/CyclingTypewriter'
import { InlineLink } from '../components/InlineLink'
import { SpriteWithFirework } from '../components/SpriteWithFirework'
import { AnimatedName } from '../components/AnimatedName'
import { NowPlaying } from '../components/NowPlaying'
import { WorkingHours } from './WorkingHours'
import { sprites } from '../data/sprites'

interface HeroProps {
  typewriterStart: boolean
  nameStartDelay?: number
}

export function Hero({ typewriterStart, nameStartDelay }: HeroProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1 text-text">
          {sprites.map(({ id, el, delay }) => (
            <SpriteWithFirework key={id} delay={delay}>
              {el}
            </SpriteWithFirework>
          ))}
        </div>
              <CyclingTypewriter
                phrases={[
                  'hello, world',
                  'it works on my machine',
                  'console.log(🐛)',
                  'npm install happiness',
                  '404: sleep not found',
                  'there is no place like 127.0.0.1',
                  'coffee first, code later',
                  'undefined is not a function',
                  'git commit -m "fix"',
                  'i speak fluent regex',
                  'hello from the other side... of the stack',
                ]}
                start={typewriterStart}
              />
      </div>

      <div className="mb-6">
        <h1 className="name-title name-title--hero text-[clamp(2rem,7vw,3.75rem)] font-bold tracking-[-0.03em] leading-[1.08]">
          <AnimatedName startDelay={nameStartDelay}>Lê Vĩnh Khang</AnimatedName>
        </h1>
        <span className="block mt-2 text-muted text-lg">Developer & maker</span>
        <NowPlaying />
        <div className="hero-divider" />
        <WorkingHours />
      </div>

      <div className="space-y-4 text-[17px] leading-[1.7] text-text-secondary max-w-[620px] mb-10">
        <p>
          Code's my happy place. Somewhere between a frontend engineer and a person who firmly believes semicolons are optional — until they're not.
        </p>
        <p>
          When I'm not wrestling with CSS, you'll find me building tiny web toys, talking to my terminal like it's a Tamagotchi, or convincing people that dark mode is not a personality.
        </p>
      </div>

      <div className="text-[17px] leading-[1.7] text-text-secondary">
        <p>
          Get in touch{' '}
          <InlineLink href="mailto:williamcachamwri@gmail.com">williamcachamwri@gmail.com</InlineLink>{' '}
          or yell at me on{' '}
          <InlineLink href="https://github.com/williamcachamwri">GitHub</InlineLink>
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[15px]">
          <Link to="/blog" className="subtle-link">
            blog ›
          </Link>
          <Link to="/guestbook" className="subtle-link">
            guestbook ›
          </Link>
          <Link to="/universe" className="subtle-link">
            universe ›
          </Link>
        </p>
      </div>
    </section>
  )
}
