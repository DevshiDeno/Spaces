import { motion } from 'framer-motion';
import { Search, Calendar, Heart } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section, SectionHeading } from '@/components/ui/Section';

const steps = [
  {
    icon: Search,
    title: 'Discover',
    description:
      'Browse our curated list of verified inclusive venues across Kenya — filter by mood, capacity, and time of day.',
  },
  {
    icon: Calendar,
    title: 'Book',
    description:
      'Reserve in minutes with M-Pesa or card. Transparent fees, real-time availability, no surprises.',
  },
  {
    icon: Heart,
    title: 'Connect',
    description:
      'Host or attend events in spaces where everyone feels welcome — with safer-space training built in.',
  },
];

export function HowItWorksSection() {
  return (
    <Section spacing="normal" id="how-it-works">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="How it Works"
          title="Whether you're looking for a space or want to list one"
          description="We've made the process simple — three steps from search to soulful gathering."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative rounded-2xl border border-border bg-card p-8"
              >
                <div className="absolute -top-4 left-8 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-coral-400 to-coral-600 text-white shadow-lg shadow-coral-500/25">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-semibold tracking-[0.18em] text-muted-foreground">
                  STEP {idx + 1}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
