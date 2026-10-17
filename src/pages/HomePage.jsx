import { Link } from 'react-router-dom';

// Temporary landing page. Phase 10 replaces it with search, categories and upcoming events.
export default function HomePage() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <h1 className="hero-title">Find something to go to.</h1>
        <p className="hero-text">
          Browse live events, register in one click, and keep every plan in one list.
        </p>
        <Link to="/register" className="btn btn-primary">Create an account</Link>
      </div>
    </section>
  );
}
