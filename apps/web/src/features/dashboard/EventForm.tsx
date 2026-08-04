import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { EVENT_CATEGORIES } from '@/constants';
import { cn } from '@/utils/cn';
import type { AppEvent } from '@/types';

export const eventFormSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    category: z.string().min(1, 'Pick a category'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    startDate: z.string().min(1, 'Start date & time is required'),
    endDate: z.string().min(1, 'End date & time is required'),
    city: z.string().min(1, 'City is required'),
    venueId: z.string().optional().default(''),
    pricePerTicket: z.coerce.number().int().min(0, 'Price cannot be negative'),
    ticketsAvailable: z.coerce.number().int().min(1, 'Must offer at least 1 ticket'),
    coverImage: z.string().min(1, 'Upload a cover image'),
    isFeatured: z.boolean(),
    organizer: z.string().min(2, 'Organizer is required'),
  })
  .superRefine((val, ctx) => {
    if (val.startDate && val.endDate && val.endDate <= val.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End must be after the start',
      });
    }
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const EVENT_FORM_EMPTY_DEFAULTS: EventFormValues = {
  title: '',
  category: '',
  description: '',
  startDate: '',
  endDate: '',
  city: '',
  venueId: '',
  pricePerTicket: 0,
  ticketsAvailable: 50,
  coverImage: '',
  isFeatured: false,
  organizer: '',
};

/** Formats an ISO date-time into the `YYYY-MM-DDTHH:mm` a datetime-local input expects (in local time). */
export function toDateTimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** Maps a persisted event onto editable form values. */
export function eventToFormValues(event: AppEvent): EventFormValues {
  return {
    title: event.title,
    category: event.category,
    description: event.description,
    startDate: toDateTimeLocalValue(event.startDate),
    endDate: toDateTimeLocalValue(event.endDate),
    city: event.city,
    venueId: event.venueId ?? '',
    pricePerTicket: event.pricePerTicket,
    ticketsAvailable: event.ticketsAvailable,
    coverImage: event.coverImage,
    isFeatured: event.isFeatured ?? false,
    organizer: event.organizer,
  };
}

export interface VenueOption {
  id: string;
  name: string;
}

interface EventFormProps {
  defaultValues: EventFormValues;
  venues: VenueOption[];
  onSubmit: (values: EventFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel: string;
}

export function EventForm({
  defaultValues,
  venues,
  onSubmit,
  onCancel,
  submitLabel,
}: EventFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  const [coverUploadedNow, setCoverUploadedNow] = useState(false);
  const coverImage = watch('coverImage');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title="Basics" description="The headline details guests see first.">
        <Input
          label="Title"
          placeholder="Sunset Listening Party"
          error={errors.title?.message}
          {...register('title')}
        />
        <Select
          label="Category"
          placeholder="Choose a category"
          options={EVENT_CATEGORIES.map((c) => ({ label: c, value: c }))}
          error={errors.category?.message}
          {...register('category')}
        />
        <Textarea
          label="Description"
          rows={5}
          placeholder="What's happening, who's it for, and what should guests expect?"
          error={errors.description?.message}
          {...register('description')}
        />
        <Input
          label="Organizer"
          placeholder="Mzizi Collective"
          error={errors.organizer?.message}
          {...register('organizer')}
        />
      </FormSection>

      <FormSection title="When & where" description="Local time. Guests see the venue if you link one.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Starts"
            type="datetime-local"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            label="Ends"
            type="datetime-local"
            error={errors.endDate?.message}
            {...register('endDate')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="City"
            placeholder="Nairobi"
            error={errors.city?.message}
            {...register('city')}
          />
          <Select
            label="Venue (optional)"
            placeholder="No linked venue"
            options={venues.map((v) => ({ label: v.name, value: v.id }))}
            hint="Link one of your spaces to show it on the event."
            error={errors.venueId?.message}
            {...register('venueId')}
          />
        </div>
      </FormSection>

      <FormSection title="Tickets" description="All amounts are in KES. Set price to 0 for a free event.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Price per ticket"
            type="number"
            min={0}
            hint="KES per ticket (0 = free)"
            error={errors.pricePerTicket?.message}
            {...register('pricePerTicket')}
          />
          <Input
            label="Tickets available"
            type="number"
            min={1}
            error={errors.ticketsAvailable?.message}
            {...register('ticketsAvailable')}
          />
        </div>
      </FormSection>

      <FormSection title="Cover image" description="The hero image shown across listings. Required.">
        {coverImage ? (
          <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border">
            <img src={coverImage} alt="Cover" className="aspect-video w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setValue('coverImage', '', { shouldValidate: true });
                setCoverUploadedNow(false);
              }}
              className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-white hover:bg-black/80"
              aria-label="Remove cover image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <ImageUploader
            folder="events/covers"
            multiple={false}
            maxFiles={1}
            onUploaded={(urls) => {
              if (urls[0]) {
                setValue('coverImage', urls[0], { shouldValidate: true });
                setCoverUploadedNow(true);
              }
            }}
          />
        )}
        {errors.coverImage?.message && (
          <p className="text-xs text-destructive">{errors.coverImage.message}</p>
        )}
        {coverUploadedNow && (
          <p className="inline-flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3 w-3" /> Cover uploaded
          </p>
        )}
      </FormSection>

      <FormSection title="Visibility" description="Featured events surface on the homepage and listings.">
        <Controller
          control={control}
          name="isFeatured"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              <ChipButton active={field.value} onClick={() => field.onChange(true)}>
                Featured
              </ChipButton>
              <ChipButton active={!field.value} onClick={() => field.onChange(false)}>
                Standard
              </ChipButton>
            </div>
          )}
        />
      </FormSection>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground hover:border-primary/40'
      )}
    >
      {children}
    </button>
  );
}
