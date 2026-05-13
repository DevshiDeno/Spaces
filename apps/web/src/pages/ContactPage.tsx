import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { useToast } from '@/hooks/useToast';
import { applicationsService } from '@/services/applications.service';
import { COMPANY_LOCATION, SUPPORT_EMAIL, SUPPORT_PHONE } from '@/constants';

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(2, 'Please enter a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  isVenueInquiry: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

export default function ContactPage() {
  const toast = useToast();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isVenueInquiry: false },
  });

  async function onSubmit(values: FormValues) {
    try {
      await applicationsService.sendContact(values);
      toast.success('Message sent!', "We'll get back to you within 24-48 hours.");
      setSubmitted(true);
      reset();
    } catch {
      toast.error('Failed to send', 'Please try again.');
    }
  }

  return (
    <Section spacing="tight">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Get in Touch</span>
            <h1 className="heading-display mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Have questions or want to learn more?
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              We'd love to hear from you. Whether you're looking for a space or want to become an
              ally, we'd love to have you.
            </p>

            <div className="mt-10 space-y-5">
              <ContactRow icon={<Mail className="h-5 w-5 text-primary" />} label="Email" value={SUPPORT_EMAIL} />
              <ContactRow icon={<Phone className="h-5 w-5 text-primary" />} label="Phone" value={SUPPORT_PHONE} />
              <ContactRow icon={<MapPin className="h-5 w-5 text-primary" />} label="Location" value={COMPANY_LOCATION} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight">Send us a message</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill out the form below and we'll get back to you within 5-7 business days.
            </p>

            {submitted ? (
              <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                <p className="text-base font-medium">Message sent — thanks for reaching out.</p>
                <Button variant="link" className="mt-2" onClick={() => setSubmitted(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Your Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
                  <Input label="Email Address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
                </div>
                <Input label="Subject" placeholder="How can we help?" error={errors.subject?.message} {...register('subject')} />
                <Textarea
                  label="Message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  error={errors.message?.message}
                  {...register('message')}
                />
                <Checkbox label="I'm a venue owner interested in joining the network" {...register('isVenueInquiry')} />
                <Button type="submit" fullWidth isLoading={isSubmitting} rightIcon={<Send className="h-4 w-4" />}>
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-base">{value}</p>
      </div>
    </div>
  );
}
