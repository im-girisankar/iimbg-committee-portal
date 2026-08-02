import { useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Team from "./pages/Team";
import Register from "./pages/Register";

/* Scroll to top on route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/* ─────────────────────────────────────────────────────────────
   App shell — Navbar + Outlet + Footer, with ScrollToTop.
   ───────────────────────────────────────────────────────────── */

function Layout() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}

function NotFound() {
  return (
    <div className="pt-24 pb-20 px-4">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-6xl font-display font-bold text-[#C9A227] mb-4">404</h1>
        <h2 className="text-2xl font-display font-semibold text-[#F2EDE3] mb-3">
          Page not found
        </h2>
        <p className="text-[#9C948A] mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A227] text-[#12100C] font-semibold rounded-xl hover:bg-[#C9A227]/90 transition"
        >
          Back to Home
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route path="team" element={<Team />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}