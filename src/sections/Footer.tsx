import { Link } from 'react-router-dom'
import { InlineLink } from '../components/InlineLink'

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
          <InlineLink href="https://github.com/williamcachamwri">github</InlineLink>
          <InlineLink href="mailto:williamcachamwri@gmail.com">email</InlineLink>
        </nav>
      </div>
      <div className="footer__bottom">
        <p>
          Built with React & Tailwind. Typeset in Inter, JetBrains Mono, and Caveat.{' '}
          <InlineLink href="#">View source</InlineLink>.
        </p>
      </div>
    </footer>
  )
}
/* 09c0bd37 */
