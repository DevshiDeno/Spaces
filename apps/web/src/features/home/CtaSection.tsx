import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export function CtaSection() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-coral-500 via-coral-600 to-accent" />
      <div className="absolute inset-0 -z-10 bg-grain opacity-30 mix-blend-overlay" />
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 className="heading-display text-4xl font-bold leading-tight text-white text-balance sm:text-5xl">
              Ready to create safer spaces?
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-white/85">
              Whether you're looking to book an inclusive venue for your next event or want to make your
              space more welcoming, we're here to help.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:col-span-4 lg:justify-end">
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/venues')}
              className="border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              Find a Space
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/become-an-ally')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="bg-white text-coral-600 hover:bg-white/95"
            >
              Become an Ally
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
