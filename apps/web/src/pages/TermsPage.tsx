import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';

export default function TermsPage() {
  return (
    <Section spacing="tight">
      <Container size="md">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Terms of Service</span>
        <h1 className="heading-display mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Terms and conditions for using Spaces For you
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          By using Spaces For you, you agree to these Terms of Service. Please read them carefully
          before using our platform.
        </p>

        <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert">
          <Heading>1. Use of the Platform</Heading>
          <p>You must be at least 18 years old to use Spaces For you.</p>
          <Heading>2. Bookings & Payments</Heading>
          <p>
            All bookings are subject to availability. Payment is processed via M-Pesa or supported
            card networks at the time of booking.
          </p>
          <Heading>3. Cancellations & Refunds</Heading>
          <p>
            Cancellations made more than 48 hours in advance are eligible for a refund minus the
            booking fee.
          </p>
          <Heading>4. Code of Conduct</Heading>
          <p>
            All ally venues and guests are expected to uphold the Spaces For you code of conduct
            against harassment and discrimination.
          </p>
        </div>
      </Container>
    </Section>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 text-xl font-semibold tracking-tight">{children}</h2>;
}
