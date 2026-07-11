import { GlowCard } from '@/src/components/ui/spotlight-card';

export function Default() {
  return (
    <div className="custom-cursor flex h-screen w-screen flex-row items-center justify-center gap-10">
      <GlowCard />
      <GlowCard />
      <GlowCard />
    </div>
  );
}
