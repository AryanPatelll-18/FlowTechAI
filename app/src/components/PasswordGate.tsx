import { useState, useEffect, useRef } from "react";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ACCESS_PASSWORD = "Flowtech2026";
const STORAGE_KEY = "flowtech_auth";

interface PasswordGateProps {
  children: React.ReactNode;
}

/* Subtle floating particles for background animation */
function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Array<{
      x: number; y: number; vx: number; vy: number; r: number; alpha: number;
    }> = [];
    // Denser particle field for visible background animation
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2.0 + 1.0,
        alpha: Math.random() * 0.35 + 0.12,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 0, 44, ${p.alpha})`;
        ctx.fill();
      });
      // Draw connections — longer distance, stronger alpha
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(226, 0, 44, ${0.12 * (1 - dist / 220)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem(STORAGE_KEY);
    if (auth === "true") setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogin = () => {
    if (isLocked) return;
    if (!password.trim()) {
      setError("Please enter the password");
      return;
    }
    if (password === ACCESS_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(`Invalid password. Attempt ${newAttempts}/5`);
      setPassword("");
      if (newAttempts >= 5) {
        setIsLocked(true);
        setError("Too many failed attempts. Refresh the page to retry.");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#111] text-white overflow-x-hidden w-full">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[100dvh] flex flex-col overflow-hidden w-full">
        {/* Background layers */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url(/hero_bg.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111] via-transparent to-[#111]" />
        <FloatingParticles />

        {/* Top bar */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            scrolled ? "bg-[#111]/90 backdrop-blur-md border-b border-white/5" : ""
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] tracking-[0.15em] text-gray-500 hover:text-red-400 transition-colors">
              flowtech-instruments.com
            </span>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center pt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Text */}
              <div className="space-y-6 sm:space-y-8">
                {/* Logo + Name */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src="/flowtech_logo_white.png"
                    alt="Flowtech Instruments"
                    className="h-16 sm:h-20 w-auto object-contain"
                    style={{ imageRendering: 'auto' }}
                  />
                  <div className="border-l border-white/20 pl-3 sm:pl-4">
                    <div className="text-base sm:text-lg font-semibold text-white tracking-wide">
                      Flowtech Instruments
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-gray-500 tracking-wide">
                      flowtech-instruments.com
                    </span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-red-500 font-medium">
                    <span className="w-6 sm:w-8 h-px bg-red-500" />
                    AI Flow Sizing Calculator
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1]">
                    <span className="text-white">Precision Flow</span>{" "}
                    <span className="font-semibold text-red-500">Meter Sizing</span>
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500 max-w-md leading-relaxed">
                    Intelligent flowmeter selection powered by 220+ fluids, 80+
                    gases, steam property tables, and factory Qmin/Qmax data.
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-6 sm:gap-10">
                  {[
                    { value: "220+", label: "Liquids" },
                    { value: "80+", label: "Gases" },
                    { value: "7", label: "Products" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-xl sm:text-2xl font-semibold text-white">
                        {stat.value}
                      </div>
                      <div className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-gray-600 mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div>
                  <Button
                    onClick={() =>
                      document
                        .getElementById("login")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="group bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-5 sm:py-6 text-sm font-medium tracking-wide rounded-sm shadow-lg shadow-red-900/30 transition-all hover:shadow-red-900/50"
                  >
                    <Lock className="w-4 h-4 mr-2 sm:mr-3" />
                    Access Calculator
                    <ArrowRight className="w-4 h-4 ml-2 sm:ml-3 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>

              {/* Right: Login card (desktop only) */}
              <div id="desktop-login" className="hidden lg:block">
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-sm p-8 sm:p-10 max-w-md ml-auto">
                  <div className="space-y-5 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-white mb-1">
                        Secure Access
                      </h3>
                      <p className="text-xs text-gray-600">
                        Enter password to launch the calculator
                      </p>
                    </div>

                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Password"
                        className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-700 h-12 rounded-sm"
                        disabled={isLocked}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {error && (
                      <div
                        className={`text-xs px-3 py-2.5 rounded-sm ${
                          isLocked
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {error}
                      </div>
                    )}

                    <Button
                      onClick={handleLogin}
                      disabled={isLocked}
                      className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-sm font-medium tracking-wide"
                    >
                      Sign In
                    </Button>

                    <p className="text-[10px] text-center text-gray-700 tracking-wide">
                      Contact your Flowtech admin for access credentials
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-[#111] to-transparent z-10" />
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="relative z-10 bg-[#111] py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 space-y-3">
            <span className="text-[10px] tracking-[0.3em] uppercase text-red-500">
              Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-white">
              Built for <span className="font-medium">Precision</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-sm overflow-hidden">
            {[
              {
                num: "01",
                title: "Fluid Database",
                desc: "220+ liquids with AI search, temperature-corrected density & viscosity via Vogel-Cameron models.",
              },
              {
                num: "02",
                title: "Velocity Mapping",
                desc: "Real-time velocity per pipe size using ISO Schedule 40 inner diameters. Input flow velocity highlighted.",
              },
              {
                num: "03",
                title: "Factory Tables",
                desc: "Exact Qmin/Qmax from Flowtech Master Metal Table. Hard limits enforced: pressure, viscosity, conductivity, temperature.",
              },
              {
                num: "04",
                title: "Three Services",
                desc: "Liquids with 5 unit options (m/hr, lph, lpm, kg/hr, CFM). Gas with 80+ gas database. Steam with saturated property tables.",
              },
              {
                num: "05",
                title: "Unit Conversion",
                desc: "Automatic flow rate conversion with parameter validation. Missing density, pressure or temperature highlighted with clear guidance.",
              },
              {
                num: "06",
                title: "Smart Validation",
                desc: "Fluid property mismatch detection, non-Newtonian warnings, concentration alerts, and conductivity checks for EM suitability.",
              },
            ].map((feat) => (
              <div
                key={feat.num}
                className="bg-[#161616] p-6 sm:p-8 hover:bg-[#1a1a1a] transition-colors"
              >
                <span className="text-[10px] tracking-[0.2em] text-red-500/60 font-medium">
                  {feat.num}
                </span>
                <h3 className="text-sm font-medium text-white mt-3 mb-2 tracking-wide">
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MOBILE LOGIN ===== */}
      <section id="login" className="lg:hidden relative z-10 bg-[#111] px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="bg-white/[0.03] border border-white/10 rounded-sm p-6 sm:p-8 max-w-sm mx-auto">
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-medium text-white mb-1">
                Secure Access
              </h3>
              <p className="text-xs text-gray-600">
                Enter password to continue
              </p>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="Password"
                className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-700 h-12 rounded-sm"
                disabled={isLocked}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {error && (
              <div
                className={`text-xs px-3 py-2 rounded-sm ${
                  isLocked
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {error}
              </div>
            )}
            <Button
              onClick={handleLogin}
              disabled={isLocked}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-sm font-medium"
            >
              Access Calculator
            </Button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 bg-[#0d0d0d] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-gray-700 tracking-wide">
            Flowtech Instruments &copy; 2026
          </p>
          <a
            href="https://flowtech-instruments.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-gray-600 hover:text-red-400 transition-colors tracking-wide"
          >
            flowtech-instruments.com
          </a>
          <p className="text-[10px] text-gray-700 tracking-wide">
            Confidential &middot; Authorized Access Only
          </p>
        </div>
      </footer>
    </div>
  );
}
