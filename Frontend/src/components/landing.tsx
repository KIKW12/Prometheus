import { Brain, Zap, Shield, Search, UserCheck, MessageSquare } from "lucide-react";

export default function Landing() {
  return (
    <main className="flex w-full flex-1 flex-col min-h-screen relative overflow-x-hidden selection:bg-primary/20">
      <div className="flex flex-col justify-between h-full pt-8 pb-0 relative z-10">

        {/* Header */}
        <div className="flex justify-between items-center px-6 md:px-12 animate-fade-in-down delay-100">
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
              <img src="/prometheus.svg" alt="Logo" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,77,0,0.5)]" />
            </div>
            <p className="text-2xl font-medium tracking-wide text-foreground font-fjalla uppercase">
              <span className="text-primary font-bold">Prometheus</span>
            </p>
          </a>
          <a href="/find/sign-in">
            <button className="relative inline-flex items-center justify-center text-sm uppercase tracking-widest font-bold transition-all focus-visible:outline-none disabled:opacity-50 border border-white/10 hover:border-primary/50 hover:bg-primary/10 hover:text-primary h-10 px-8 text-muted/80 hover:shadow-[0_0_20px_rgba(255,77,0,0.15)] rounded-sm font-fjalla glass">
              log in
            </button>
          </a>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center mt-12 md:mt-20 px-4">
          <h1 className="text-[12vmin] font-black tracking-tighter text-center text-foreground font-fjalla leading-[0.85] uppercase animate-zoom-in delay-200 drop-shadow-2xl">
            find and<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary to-orange-600 animate-glow">be found.</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-muted/60 text-center max-w-xl font-inter font-light tracking-wide animate-fade-in-up delay-300">
            The next generation of AI-powered recruitment. Match with your future instantly.
          </p>
        </div>

        {/* Action Cards */}
        <div className="flex flex-col px-4 md:px-0 mt-20 animate-fade-in-up delay-500">
          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12 w-full max-w-6xl mx-auto">
            {/* Find Column */}
            <div className="flex flex-col gap-4 flex-1 md:max-w-sm group">
              <a href="/find/sign-up" className="w-full">
                <button className="glass-card w-full text-foreground relative inline-flex items-center justify-between text-4xl uppercase tracking-tighter px-8 py-6 font-fjalla text-left">
                  Find
                  <span className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary">→</span>
                </button>
              </a>
              <p className="text-base text-muted/50 pl-1 group-hover:text-muted transition-colors duration-300 font-inter">
                <span className="text-primary font-medium">For Recruiters.</span> Find the perfect fit without the noise using our advanced AI matching.
              </p>
            </div>

            {/* Be Found Column */}
            <div className="flex flex-col gap-4 flex-1 md:max-w-sm group">
              <a href="/register" className="w-full">
                <button className="glass-card w-full text-foreground relative inline-flex items-center justify-between text-4xl uppercase tracking-tighter px-8 py-6 font-fjalla text-left">
                  Be Found
                  <span className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary">→</span>
                </button>
              </a>
              <p className="text-base text-muted/50 pl-1 group-hover:text-muted transition-colors duration-300 font-inter">
                <span className="text-primary font-medium">For Talent.</span> Create your profile once. Let opportunities find you automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Infinite Carousel */}
        <div className="mt-24 flex flex-col gap-4 animate-fade-in-up delay-700">
          <div className="relative h-72 w-full max-w-[1400px] mx-auto overflow-hidden carousel-container" role="region" aria-roledescription="carousel">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--background)] to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--background)] to-transparent z-20 pointer-events-none" />

            <div className="carousel gap-6 py-4">
              {/* Carousel Items - Repeated x3 for smooth seamless loop */}
              {[...Array(3)].map((_, setIndex) => (
                ["/kike.jpeg", "/mateo.jpeg", "/Ian.jpg", "/leo.jpg", "/jhon.jpg"].map((src, index) => {
                  const names = ["Kike", "Mateo", "Ian", "Leo", "Jhon"];
                  const roles = ["Founder", "Lead Eng", "Product", "Designer", "Engineer"];
                  return (
                    <div key={`${setIndex}-${index}`} className="shrink-0 w-[240px]">
                      <div className="glass-card h-[280px] p-4 flex flex-col items-center gap-4 group cursor-pointer">
                        <div className="relative w-full aspect-square overflow-hidden rounded-sm border border-white/5 group-hover:border-primary/20 transition-colors">
                          <img
                            src={src}
                            alt={names[index]}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                          <div className="absolute bottom-3 left-3">
                            <h3 className="text-xl font-fjalla text-white tracking-wide uppercase">{names[index]}</h3>
                          </div>
                        </div>
                        <div className="w-full flex justify-between items-center px-1">
                          <p className="text-xs font-bold uppercase tracking-widest text-primary/80 group-hover:text-primary transition-colors">
                            {roles[index]}
                          </p>
                          <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary/80 transition-colors" />
                        </div>
                      </div>
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-32 px-6 md:px-12 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "AI-Powered Matching", desc: "Our neural networks understand nuance not just keywords, connecting you with the right opportunities instantly." },
              { icon: Zap, title: "Instant Connections", desc: "Skip the waiting game. Get matched with candidates or companies that are actively looking for you right now." },
              { icon: Shield, title: "Verified Profiles", desc: "Trust in the process. Every profile is verified to ensure quality and authenticity in your search." }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-8 flex flex-col gap-6 group hover:bg-white/5">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-fjalla uppercase tracking-wide mb-3">{feature.title}</h3>
                  <p className="text-muted/80 font-inter font-light leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-24 px-6 md:px-12 w-full bg-gradient-to-b from-transparent via-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-fjalla uppercase text-center mb-20 tracking-tighter">
              How it <span className="text-primary">Works</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {[
                { icon: Search, title: "Create Profile", step: "01" },
                { icon: UserCheck, title: "Get Matched", step: "02" },
                { icon: MessageSquare, title: "Connect", step: "03" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center relative z-10">
                  <div className="w-24 h-24 rounded-full glass flex items-center justify-center mb-8 border border-primary/30 group hover:scale-110 transition-transform duration-500 hover:shadow-[0_0_40px_rgba(255,77,0,0.3)]">
                    <item.icon className="w-10 h-10 text-foreground" />
                  </div>
                  <div className="text-9xl font-black font-fjalla text-white/5 absolute -top-10 z-0 select-none">
                    {item.step}
                  </div>
                  <h3 className="text-3xl font-fjalla uppercase mb-4 relative z-10">{item.title}</h3>
                  <p className="text-muted max-w-xs font-inter font-light">
                    Simple steps to get you where you need to be. No friction, just results.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/40 backdrop-blur-md pt-20 pb-10 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="flex flex-col gap-6 max-w-sm">
              <a href="/" className="flex items-center gap-3">
                <img src="/prometheus.svg" alt="Logo" className="w-10 h-10 opacity-80" />
                <span className="text-2xl font-medium font-fjalla uppercase tracking-wide">Prometheus</span>
              </a>
              <p className="text-muted/60 font-inter font-light">
                Redefining recruitment through intelligent, automated matching.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-16">
              <div className="flex flex-col gap-4">
                <h4 className="font-fjalla uppercase tracking-widest text-sm text-primary">Platform</h4>
                <a href="/find/sign-up" className="text-muted/60 hover:text-white transition-colors">Find Talent</a>
                <a href="/register" className="text-muted/60 hover:text-white transition-colors">Find Work</a>
                <a href="#" className="text-muted/60 hover:text-white transition-colors">Pricing</a>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-fjalla uppercase tracking-widest text-sm text-primary">Company</h4>
                <a href="#" className="text-muted/60 hover:text-white transition-colors">About</a>
                <a href="#" className="text-muted/60 hover:text-white transition-colors">Blog</a>
                <a href="#" className="text-muted/60 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-muted/40 font-inter uppercase tracking-widest">
            <p>&copy; 2024 Prometheus AI. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}