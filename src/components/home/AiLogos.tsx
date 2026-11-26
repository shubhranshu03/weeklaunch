// Logos of the AI assistants that read IndieShip pages (via llms.txt, the sitemap
// and each product page). The SVGs in /public/ai come from LobeHub Icons (MIT).

export const aiAssistants = [
  { name: "ChatGPT", src: "/ai/chatgpt.svg" },
  { name: "Claude", src: "/ai/claude.svg" },
  { name: "Gemini", src: "/ai/gemini.svg" },
  { name: "Perplexity", src: "/ai/perplexity.svg" },
  { name: "Copilot", src: "/ai/copilot.svg" },
];

export function AiLogos() {
  return (
    <span className="flex -space-x-1.5">
      {aiAssistants.map((a) => (
        <span
          key={a.name}
          title={a.name}
          className="flex size-8 items-center justify-center rounded-full bg-[#fff] shadow-sm ring-2 ring-card"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG */}
          <img src={a.src} alt={a.name} className="size-[18px]" />
        </span>
      ))}
    </span>
  );
}
