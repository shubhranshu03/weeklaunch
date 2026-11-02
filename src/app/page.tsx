import { Leaderboard } from "@/components/Leaderboard";
import { SiteShell } from "@/components/SiteShell";
import { Testimonials } from "@/components/Testimonials";

export default function Home() {
  return (
    <SiteShell after={<Testimonials />}>
      <h1 className="sr-only">
        This week&apos;s product launches on WeekLaunch
      </h1>
      <Leaderboard />
    </SiteShell>
  );
}
