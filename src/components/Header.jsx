import { LogoMark } from './ui/Icons'

export default function Header() {
  return (
    <header className="site-header">
      <nav className="container site-nav" aria-label="Primary">
        <a className="site-nav__link" href="#rules">
          The rules
        </a>

        <a className="brand" href="#top" aria-label="SplitEasy, back to top">
          <span className="brand__mark" aria-hidden="true">
            <LogoMark size={21} />
          </span>
          <span className="brand__name">SplitEasy</span>
        </a>

        <a
          className="site-nav__link site-nav__link--strong"
          href="#group"
        >
          Group setup
        </a>
      </nav>
    </header>
  )
}
