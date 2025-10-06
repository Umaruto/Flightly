import Container from './Container'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white/70">
      <Container className="py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-lg font-semibold text-slate-900">✈️ Flightly</div>
            <div className="text-sm text-slate-600 mt-1">Simple flight search and booking demo</div>
          </div>
          <div className="flex gap-8 text-sm text-slate-600">
            <div>
              <div className="font-semibold text-slate-800">Product</div>
              <ul className="mt-2 space-y-1">
                <li><Link className="hover:text-blue-700" to="/">Home</Link></li>
                <li><Link className="hover:text-blue-700" to="/search">Search</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-slate-800">Company</div>
              <ul className="mt-2 space-y-1">
                <li><a className="hover:text-blue-700" href="#">About</a></li>
                <li><a className="hover:text-blue-700" href="#">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-6 text-xs text-slate-500 text-center md:text-left">© {new Date().getFullYear()} Flightly. All rights reserved.</div>
      </Container>
    </footer>
  )
}
