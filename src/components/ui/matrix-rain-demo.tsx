import { MatrixRain } from "@/components/ui/matrix-rain";
import { AntiMetalButton } from "@/components/ui/anti-metal-button";

export default function MatrixRainDemo() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Background Matrix Rain with C++, Java, JavaScript falling tokens in Orange */}
      <MatrixRain className="absolute inset-0 w-full h-full opacity-70" />

      {/* Hero Overlay Content */}
      <div className="relative z-20 text-center max-w-2xl px-6 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-orange-500/30 text-orange-400 text-xs font-semibold tracking-wide backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          C++ &bull; Java &bull; JavaScript Code Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Next-Gen Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Underwriting</span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
          Powered by high-performance algorithmic risk evaluation. Real-time deterministic decisioning in your browser.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <AntiMetalButton label="Explore Engine" />
          <AntiMetalButton label="Start Application" />
        </div>
      </div>
    </div>
  );
}
