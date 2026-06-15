import { Link } from 'react-router-dom'
import { InlineLink } from '../components/InlineLink'
import { NowPlaying } from '../components/NowPlaying'
import { BuildInfo } from '../components/BuildInfo'
import { LighthouseBadge } from '../components/LighthouseBadge'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <span className="footer__name">Lê Vĩnh Khang</span>
          <span className="footer__role">Developer & maker</span>
        </div>
        <nav className="footer__links">
          <Link to="/" className="footer__link">home</Link>
          <Link to="/blog" className="footer__link">blog</Link>
          <Link to="/guestbook" className="footer__link">guestbook</Link>
          <InlineLink href="https://github.com/williamcachamwri">github</InlineLink>
          <InlineLink href="mailto:williamcachamwri@gmail.com">email</InlineLink>
          <a href="/feed.xml" target="_blank" rel="noopener noreferrer" className="footer__rss" title="RSS feed">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="18" r="3"/>
              <path d="M4 11a9 9 0 0 1 9 9M4 4a15 15 0 0 1 15 15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </a>
        </nav>
      </div>
      <div className="footer__bottom">
        <p>
          built with patience · styled with restraint
          <span className="footer__inspired">
            {' '}· inspired by{' '}
            <InlineLink href="https://trongduong.com">duongductrong</InlineLink>
          </span>
        </p>
        <NowPlaying />
        <BuildInfo />
        <LighthouseBadge />
      </div>
    </footer>
  )
}
