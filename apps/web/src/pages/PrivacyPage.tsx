import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';

export default function PrivacyPage() {
  return (
    <Section spacing="tight">
      <Container size="md">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Privacy Policy</span>
        <h1 className="heading-display mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Our privacy policy and data protection practices
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          At Spaces For you, we take your privacy seriously. This Privacy Policy explains how we
          collect, use, and protect your personal information.
        </p>

        <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert">
          <Heading>1. Information We Collect</Heading>
          <p>
            We collect information you provide directly to us, including name, email, phone, and
            payment details when you create an account, book a venue, or list your space.
          </p>
          <Heading>2. How We Use Information</Heading>
          <p>
            We use your information to facilitate bookings, communicate with you, improve our
            services, and meet our compliance obligations.
          </p>
          <Heading>3. Sharing of Information</Heading>
          <p>
            We share information with venue owners only as needed to fulfill bookings. We never sell
            your personal data.
          </p>
          <Heading>4. Your Rights</Heading>
          <p>
            You may request access, correction, or deletion of your data at any time. Contact us at
            privacy@qreativespaces.co.ke.
          </p>
        </div>
      </Container>
    </Section>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 text-xl font-semibold tracking-tight">{children}</h2>;
}
