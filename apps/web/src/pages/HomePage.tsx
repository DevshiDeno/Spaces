import { HeroSection } from '@/features/home/HeroSection';
import { FeaturedVenuesSection } from '@/features/home/FeaturedVenuesSection';
import { HowItWorksSection } from '@/features/home/HowItWorksSection';
import { ValuesSection } from '@/features/home/ValuesSection';
import { UpcomingEventsSection } from '@/features/home/UpcomingEventsSection';
import { CtaSection } from '@/features/home/CtaSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedVenuesSection />
      <HowItWorksSection />
      <ValuesSection />
      <UpcomingEventsSection />
      <CtaSection />
    </>
  );
}
