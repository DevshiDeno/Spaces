import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { useToast } from '@/hooks/useToast';
import { applicationsService } from '@/services/applications.service';
import { CITIES, VENUE_TYPES } from '@/constants';

const schema = z.object({
  businessName: z.string().min(2, 'Required'),
  ownerName: z.string().min(2, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(7, 'Required'),
  city: z.string().min(1, 'Required'),
  address: z.string().min(2, 'Required'),
  venueType: z.string().min(1, 'Required'),
  description: z.string().min(20, 'Tell us a bit more (20+ chars)'),
  motivation: z.string().min(20, 'Tell us a bit more (20+ chars)'),
  inclusivityPlan: z.string().min(20, 'Tell us a bit more (20+ chars)'),
  experience: z.string().optional(),
  agreesToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to continue' }),
  }),
});

type FormValues = z.infer<typeof schema>;

const benefits = [
  { icon: ShieldCheck, title: 'Get Certified', description: 'Earn the Qreative Space badge to show your commitment to inclusivity.' },
  { icon: TrendingUp, title: 'Increase Bookings', description: 'Reach a diverse community looking for inclusive spaces.' },
  { icon: Users, title: 'Join a Network', description: 'Connect with other ally venues and share best practices.' },
  { icon: Sparkles, title: 'Inclusive Training', description: 'Free safer-space training for your team and venue.' },
];

export default function BecomeAnAllyPage() {
  const toast = useToast();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    try {
      await applicationsService.submit(values);
      toast.success('Application submitted!', "We'll review it within 5-7 business days.");
      setSubmitted(true);
      reset();
    } catch {
      toast.error('Failed to submit application', 'Please try again.');
    }
  }

  return (
    <>
      <Section spacing="tight" className="bg-gradient-to-br from-coral-50 to-cream dark:from-card dark:to-background">
        <Container>
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Become a Qreative Space
            </span>
            <h1 className="heading-display mt-3 text-4xl font-bold leading-tight text-balance sm:text-5xl lg:text-6xl">
              Become a Qreative Space Ally.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Earn our official badge as proof of your commitment to responsible hospitality. Join a
              network of verified venues committed to safety and inclusion.
            </p>
          </div>
        </Container>
      </Section>

      <Section spacing="tight" id="training">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Why Apply"
            title="Built for venues who care."
            description="Four reasons venue owners across Kenya are joining the network."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold tracking-tight">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.description}</p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section spacing="normal">
        <Container size="md">
          <SectionHeading
            align="center"
            eyebrow="Application"
            title="Apply to Become an Ally"
            description="Tell us about your space. We'll review your application within 5-7 business days."
          />

          <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
            {submitted ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Application submitted!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thank you for your interest in becoming a Qreative Space ally. We've received your
                  application and will review it within 5-7 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <FormSection title="Business Information">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Business Name" placeholder="Your business name" error={errors.businessName?.message} {...register('businessName')} />
                    <Input label="Owner Name" placeholder="John Doe" error={errors.ownerName?.message} {...register('ownerName')} />
                    <Input label="Email Address" type="email" error={errors.email?.message} {...register('email')} />
                    <Input label="Phone Number" type="tel" error={errors.phone?.message} {...register('phone')} />
                    <Select
                      label="City"
                      placeholder="Select city"
                      error={errors.city?.message}
                      options={CITIES.map((c) => ({ label: c, value: c }))}
                      {...register('city')}
                    />
                    <Input label="Full Address" error={errors.address?.message} {...register('address')} />
                    <Select
                      label="Venue Type"
                      placeholder="Select type"
                      error={errors.venueType?.message}
                      options={VENUE_TYPES.map((t) => ({ label: t, value: t }))}
                      {...register('venueType')}
                    />
                  </div>
                </FormSection>

                <FormSection title="Application Questions">
                  <Textarea
                    label="Describe your space"
                    placeholder="Describe your space, capacity, amenities..."
                    error={errors.description?.message}
                    {...register('description')}
                  />
                  <Textarea
                    label="What's your motivation for joining?"
                    placeholder="Tell us your motivation..."
                    error={errors.motivation?.message}
                    {...register('motivation')}
                  />
                  <Textarea
                    label="How will you ensure your space remains inclusive and safe?"
                    placeholder="Share your approach to safer-space practices..."
                    error={errors.inclusivityPlan?.message}
                    {...register('inclusivityPlan')}
                  />
                  <Textarea
                    label="Previous experience (optional)"
                    placeholder="Previous experience, training, etc. (optional)"
                    {...register('experience')}
                  />
                </FormSection>

                <Checkbox
                  label="I confirm that the information provided is accurate and I agree to uphold the values of inclusivity and safety."
                  {...register('agreesToTerms')}
                />
                {errors.agreesToTerms && (
                  <p className="-mt-4 text-xs text-destructive">{errors.agreesToTerms.message}</p>
                )}

                <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
                  Submit Application
                </Button>
              </form>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
