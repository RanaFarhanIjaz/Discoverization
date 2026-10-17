import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ToastContainer from './ToastContainer';

export default function Layout() {
  const { pathname } = useLocation();

  // Start each page at the top when navigating.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main" className="main">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
}
