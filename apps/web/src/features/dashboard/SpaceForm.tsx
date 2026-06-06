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
import { cn } from '@/utils/cn';

const VENUE_TYPES = [
  'Restaurant',
  'Studio Space',
  'Rooftop',
  'Outdoor Space',
  'Event Space',
  'Gallery',
  'Coworking',
  'Cafe',
  'Bar',
  'Other',
];

const AMENITY_OPTIONS = [
  'WiFi',
  'Parking',
  'Sound System',
  'Lighting',
  'Bar',
  'Catering kitchen',
  'Power backup',
  'Wheelchair Accessible',
  'Gender-neutral restrooms',
  'Air conditioning',
  'Projector',
  'Loading bay',
];

const MOOD_OPTIONS = ['Intimate', 'Energetic', 'Relaxed', 'Creative'] as const;
const BEST_FOR_OPTIONS = [
  'Listening parties',
  'Brand launches',
  'Cocktail parties',
  'Private dinners',
  'Workshops',
  'Photoshoots',
  'Podcast recordings',
  'Wellness circles',
  'Birthday celebrations',
  'Weddings',
  'Conferences',
];
const TIME_OF_DAY_OPTIONS = ['Morning', 'Afternoon', 'Evening'] as const;

const PHONE_REGEX = /^(?:\+?254|0)?(7|1)\d{8}$/;

export const spaceFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  tagline: z.string().min(2, 'Tagline must be at least 2 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: z.string().min(1, 'Pick a venue type'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
  pricePerHour: z.coerce.number().int().min(0, 'Price cannot be negative'),
  bookingFee: z.coerce.number().int().min(0).optional(),
  coverImage: z.string().min(1, 'Upload a cover image'),
  noiseLevel: z.enum(['QUIET', 'MODERATE', 'LOUD']),
  amenities: z.array(z.string()),
  moods: z.array(z.string()),
  bestFor: z.array(z.string()),
  timeOfDay: z.array(z.string()),
  isPublished: z.boolean(),
  payoutPhone: z
    .string()
    .min(1, 'Where should we send your bookings income?')
    .refine((v) => PHONE_REGEX.test(v.trim()), 'Use a valid Kenyan number e.g. 0712345678'),
});

export type SpaceFormValues = z.infer<typeof spaceFormSchema>;

export const SPACE_FORM_EMPTY_DEFAULTS: SpaceFormValues = {
  name: '',
  tagline: '',
  description: '',
  type: '',
  city: '',
  address: '',
  capacity: 20,
  pricePerHour: 5000,
  bookingFee: 0,
  coverImage: '',
  noiseLevel: 'MODERATE',
  amenities: [],
  moods: [],
  bestFor: [],
  timeOfDay: [],
  isPublished: true,
  payoutPhone: '',
};

interface SpaceFormProps {
  defaultValues: SpaceFormValues;
  onSubmit: (values: SpaceFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel: string;
}

export function SpaceForm({ defaultValues, onSubmit, onCancel, submitLabel }: SpaceFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SpaceFormValues>({
    resolver: zodResolver(spaceFormSchema),
    defaultValues,
  });

  const [coverUploadedNow, setCoverUploadedNow] = useState(false);
  const coverImage = watch('coverImage');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title="Basics" description="The headline details guests see first.">
        <Input
          label="Name"
          placeholder="The Alchemist Rooftop"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Tagline"
          placeholder="Iconic Westlands rooftop with panoramic city views"
          error={errors.tagline?.message}
          {...register('tagline')}
        />
        <Select
          label="Venue type"
          placeholder="Choose a type"
          options={VENUE_TYPES.map((t) => ({ label: t, value: t }))}
          error={errors.type?.message}
          {...register('type')}
        />
        <Textarea
          label="Description"
          rows={5}
          placeholder="What makes this space special? Who is it for?"
          error={errors.description?.message}
          {...register('description')}
        />
      </FormSection>

      <FormSection title="Location" description="Where guests will find you.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="City"
            placeholder="Nairobi"
            error={errors.city?.message}
            {...register('city')}
          />
          <Input
            label="Street address"
            placeholder="Parklands Road, Westlands"
            error={errors.address?.message}
            {...register('address')}
          />
        </div>
      </FormSection>

      <FormSection title="Capacity & pricing" description="All amounts are in KES.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Capacity (guests)"
            type="number"
            min={1}
            error={errors.capacity?.message}
            {...register('capacity')}
          />
          <Input
            label="Price per hour"
            type="number"
            min={0}
            hint="KES per hour"
            error={errors.pricePerHour?.message}
            {...register('pricePerHour')}
          />
          <Input
            label="Booking fee"
            type="number"
            min={0}
            hint="One-time fee (optional)"
            error={errors.bookingFee?.message}
            {...register('bookingFee')}
          />
        </div>
      </FormSection>

      <FormSection
        title="Payouts"
        description="After a customer pays, your share lands here. We disburse on a rolling basis (see the Earnings tab)."
      >
        <Input
          label="M-Pesa phone number"
          type="tel"
          inputMode="numeric"
          placeholder="0712 345 678"
          hint="Used as the destination for your booking earnings."
          error={errors.payoutPhone?.message}
          {...register('payoutPhone')}
        />
      </FormSection>

      <FormSection
        title="Cover image"
        description="The hero image shown across listings. Required."
      >
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
            folder="venues/covers"
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

      <FormSection
        title="Vibes & extras"
        description="Help guests find your space by selecting all that apply."
      >
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Noise level</label>
          <div className="flex flex-wrap gap-2">
            {(['QUIET', 'MODERATE', 'LOUD'] as const).map((level) => (
              <Controller
                key={level}
                control={control}
                name="noiseLevel"
                render={({ field }) => (
                  <ChipButton
                    active={field.value === level}
                    onClick={() => field.onChange(level)}
                  >
                    {level.charAt(0) + level.slice(1).toLowerCase()}
                  </ChipButton>
                )}
              />
            ))}
          </div>
        </div>

        <ChipMultiSelect
          label="Amenities"
          options={AMENITY_OPTIONS}
          value={watch('amenities')}
          onChange={(v) => setValue('amenities', v)}
        />
        <ChipMultiSelect
          label="Moods"
          options={[...MOOD_OPTIONS]}
          value={watch('moods')}
          onChange={(v) => setValue('moods', v)}
        />
        <ChipMultiSelect
          label="Best for"
          options={BEST_FOR_OPTIONS}
          value={watch('bestFor')}
          onChange={(v) => setValue('bestFor', v)}
        />
        <ChipMultiSelect
          label="Available times"
          options={[...TIME_OF_DAY_OPTIONS]}
          value={watch('timeOfDay')}
          onChange={(v) => setValue('timeOfDay', v)}
        />
      </FormSection>

      <FormSection title="Visibility" description="Drafts are saved but won't appear in public listings.">
        <Controller
          control={control}
          name="isPublished"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              <ChipButton active={field.value} onClick={() => field.onChange(true)}>
                Published
              </ChipButton>
              <ChipButton active={!field.value} onClick={() => field.onChange(false)}>
                Draft
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

function ChipMultiSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  }
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <ChipButton key={opt} active={value.includes(opt)} onClick={() => toggle(opt)}>
            {opt}
          </ChipButton>
        ))}
      </div>
    </div>
  );
}
