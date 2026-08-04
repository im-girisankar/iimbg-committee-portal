import { useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./components/app/navbar";
import { Footer } from "./components/app/footer";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Team from "./pages/Team";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

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
   The nav offset is applied ONCE here via padding-top: var(--nav-h) —
   pages must never hardcode a top offset again.
   ───────────────────────────────────────────────────────────── */

function Layout() {
  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="flex min-h-[calc(100dvh-var(--nav-h))] flex-col pt-[var(--nav-h)]"
      >
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </>
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