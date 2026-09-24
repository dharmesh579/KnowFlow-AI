import { Link } from "react-router";

function Navbar() {
  return (
    <header className="border-b border-stone-soft px-6 py-4 flex items-center justify-between">
      <Link to="/" className="font-serif text-lg text-ink">
        KnowFlow-AI
      </Link>
      <nav className="font-mono text-sm text-stone">
        <Link to="/chat" className="hover:text-accent">
        Chat ➡️
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;
