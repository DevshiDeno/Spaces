/* eslint-disable no-console */
import {
  PrismaClient,
  NoiseLevel,
  UserRole,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  PayoutStatus,
  type User,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Commission the platform keeps; mirrors PLATFORM_COMMISSION_PERCENT default.
const COMMISSION_PERCENT = 10;
function split(total: number) {
  const commissionAmount = Math.round((total * COMMISSION_PERCENT) / 100);
  return { commissionAmount, payoutAmount: total - commissionAmount };
}

// Dates relative to "now" so the calendar/bookings always look current at demo time.
const NOW = new Date();
function dayUtc(offsetDays: number): Date {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function main() {
  console.log('🌱 Seeding database…');

  // Hard refuse to seed weak demo passwords into prod.
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && process.env.ALLOW_PROD_SEED !== 'true') {
    console.error(
      '❌ Refusing to run the dev seed in production. It creates accounts with weak demo passwords ' +
        '(admin123 / owner123 / demo1234). If you really need to seed prod, set ALLOW_PROD_SEED=true ' +
        'AND replace the passwords first.'
    );
    process.exit(1);
  }

  // ───────── Accounts ─────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@qreativespaces.co.ke' },
    update: {},
    create: {
      email: 'admin@qreativespaces.co.ke',
      name: 'Qreative Admin',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: UserRole.ADMIN,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@qreativespaces.co.ke' },
    update: {},
    create: {
      email: 'owner@qreativespaces.co.ke',
      name: 'Wanjiru Kimani',
      passwordHash: await bcrypt.hash('owner123', 12),
      role: UserRole.SPACE_OWNER,
      isSpaceOwner: true,
    },
  });

  // A second owner so the admin payouts view shows more than one payee.
  const owner2 = await prisma.user.upsert({
    where: { email: 'david@spaces.co.ke' },
    update: {},
    create: {
      email: 'david@spaces.co.ke',
      name: 'David Mwangi',
      passwordHash: await bcrypt.hash('owner123', 12),
      role: UserRole.SPACE_OWNER,
      isSpaceOwner: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'marleydeno83@gmail.com' },
    update: {},
    create: {
      email: 'marleydeno83@gmail.com',
      name: 'Dennis Muturi',
      passwordHash: await bcrypt.hash('demo1234', 12),
      role: UserRole.USER,
    },
  });

  // ───────── Guests (so bookings have realistic customers) ─────────
  const guestPassword = await bcrypt.hash('demo1234', 12);
  const guestData = [
    { email: 'aisha.mohamed@example.com', name: 'Aisha Mohamed' },
    { email: 'brian.otieno@example.com', name: 'Brian Otieno' },
    { email: 'cynthia.wambui@example.com', name: 'Cynthia Wambui' },
    { email: 'daniel.kiprop@example.com', name: 'Daniel Kiprop' },
    { email: 'esther.njeri@example.com', name: 'Esther Njeri' },
  ];
  const guests: User[] = [];
  for (const gd of guestData) {
    guests.push(
      await prisma.user.upsert({
        where: { email: gd.email },
        update: {},
        create: { email: gd.email, name: gd.name, passwordHash: guestPassword, role: UserRole.USER },
      })
    );
  }

  // ───────── Venues ─────────
  const venues = [
    {
      slug: 'the-alchemist-rooftop',
      name: 'The Alchemist Rooftop',
      tagline: 'Iconic Westlands rooftop with panoramic city views',
      description:
        'A vibrant rooftop venue in the heart of Westlands — perfect for listening parties, brand activations, and intimate live performances.',
      type: 'Rooftop',
      city: 'Nairobi',
      address: 'Parklands Road, Westlands, Nairobi',
      capacity: 180,
      pricePerHour: 12000,
      bookingFee: 1500,
      rating: 4.8,
      reviewCount: 124,
      coverImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1600&q=80',
      images: [
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1600&q=80',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80',
        'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1600&q=80',
      ],
      amenities: ['Sound System', 'Lighting', 'Bar', 'Wheelchair Accessible', 'Gender-neutral restrooms'],
      moods: ['Energetic', 'Creative'],
      bestFor: ['Listening parties', 'Brand launches', 'Cocktail parties'],
      noiseLevel: NoiseLevel.LOUD,
      timeOfDay: ['Evening'],
      isVerified: true,
      payoutPhone: '254712345678',
      payoutTill: null,
      ownerId: owner.id,
    },
    {
      slug: 'cinnabar-green-garden',
      name: 'Cinnabar Green Garden',
      tagline: 'Lush Karen garden for slow, soulful gatherings',
      description:
        'Hidden behind a quiet Karen lane, Cinnabar Green is a botanical garden venue built for breathwork, intimate dinners, and creative workshops.',
      type: 'Outdoor Space',
      city: 'Nairobi',
      address: 'Marula Lane, Karen, Nairobi',
      capacity: 60,
      pricePerHour: 8000,
      bookingFee: 1200,
      rating: 4.9,
      reviewCount: 87,
      coverImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=80',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80',
      ],
      amenities: ['Garden seating', 'Catering kitchen', 'Parking', 'Power backup'],
      moods: ['Relaxed', 'Intimate'],
      bestFor: ['Breathwork sessions', 'Private dinners', 'Wellness circles'],
      noiseLevel: NoiseLevel.QUIET,
      timeOfDay: ['Morning', 'Afternoon'],
      isVerified: true,
      payoutPhone: '254712345678',
      payoutTill: null,
      ownerId: owner.id,
    },
    {
      slug: 'studio-kawi',
      name: 'Studio Kawi',
      tagline: 'Brutalist photo studio with cyclorama wall',
      description:
        'A 220 sqm raw concrete studio with a 6-meter cyclorama, dimmable lighting, and a dressing room. Built for editorial shoots and short film premieres.',
      type: 'Studio Space',
      city: 'Nairobi',
      address: 'Industrial Area, Nairobi',
      capacity: 30,
      pricePerHour: 6500,
      bookingFee: 1000,
      rating: 4.7,
      reviewCount: 52,
      coverImage: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1600&q=80',
      images: [
        'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1600&q=80',
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600&q=80',
        'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1600&q=80',
      ],
      amenities: ['Cyclorama', 'Continuous lighting', 'Dressing room', 'Loading bay'],
      moods: ['Creative'],
      bestFor: ['Photoshoots', 'Lookbook shoots', 'Podcast recordings'],
      noiseLevel: NoiseLevel.MODERATE,
      timeOfDay: ['Morning', 'Afternoon', 'Evening'],
      isVerified: true,
      payoutPhone: null,
      payoutTill: '5202020',
      ownerId: owner.id,
    },
    {
      slug: 'the-mint-loft',
      name: 'The Mint Loft',
      tagline: 'Sunlit industrial loft for workshops & launches',
      description:
        'A bright top-floor loft with exposed brick, fast Wi-Fi, and flexible seating — a favourite for product launches, masterclasses, and team offsites.',
      type: 'Event Hall',
      city: 'Nairobi',
      address: 'Kilimani, Nairobi',
      capacity: 90,
      pricePerHour: 9000,
      bookingFee: 1500,
      rating: 4.6,
      reviewCount: 41,
      coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
        'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1600&q=80',
      ],
      amenities: ['Projector', 'Wi-Fi', 'Whiteboards', 'Tea & coffee', 'Wheelchair Accessible'],
      moods: ['Creative', 'Focused'],
      bestFor: ['Workshops', 'Product launches', 'Team offsites'],
      noiseLevel: NoiseLevel.MODERATE,
      timeOfDay: ['Morning', 'Afternoon'],
      isVerified: true,
      payoutPhone: '254712345678',
      payoutTill: null,
      ownerId: owner.id,
    },
    {
      slug: 'tamarind-dhow-deck',
      name: 'Tamarind Dhow Deck',
      tagline: 'Oceanfront deck for sunset celebrations',
      description:
        'A breezy waterfront deck overlooking the Indian Ocean in Mombasa — built for sundowners, weddings, and coastal supper clubs.',
      type: 'Outdoor Space',
      city: 'Mombasa',
      address: 'Tudor Creek, Mombasa',
      capacity: 120,
      pricePerHour: 10000,
      bookingFee: 2000,
      rating: 4.9,
      reviewCount: 73,
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80',
        'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1600&q=80',
      ],
      amenities: ['Ocean view', 'Bar', 'Catering kitchen', 'Parking'],
      moods: ['Relaxed', 'Energetic'],
      bestFor: ['Sundowners', 'Weddings', 'Supper clubs'],
      noiseLevel: NoiseLevel.MODERATE,
      timeOfDay: ['Afternoon', 'Evening'],
      isVerified: true,
      payoutPhone: '254733998776',
      payoutTill: null,
      ownerId: owner2.id,
    },
    {
      slug: 'lakeside-pavilion-kisumu',
      name: 'Lakeside Pavilion',
      tagline: 'Lake Victoria pavilion for conferences & concerts',
      description:
        'A large covered pavilion on the shores of Lake Victoria in Kisumu — versatile space for conferences, concerts, and community gatherings.',
      type: 'Event Hall',
      city: 'Kisumu',
      address: 'Dunga Beach Road, Kisumu',
      capacity: 300,
      pricePerHour: 7500,
      bookingFee: 1500,
      rating: 4.5,
      reviewCount: 29,
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80',
      images: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80'],
      amenities: ['Stage', 'Sound System', 'Parking', 'Power backup', 'Wheelchair Accessible'],
      moods: ['Energetic'],
      bestFor: ['Conferences', 'Concerts', 'Community events'],
      noiseLevel: NoiseLevel.LOUD,
      timeOfDay: ['Morning', 'Afternoon', 'Evening'],
      isVerified: false,
      payoutPhone: '254733998776',
      payoutTill: null,
      ownerId: owner2.id,
    },
  ];

  for (const v of venues) {
    await prisma.venue.upsert({
      where: { slug: v.slug },
      update: {
        coverImage: v.coverImage,
        images: v.images,
        payoutPhone: v.payoutPhone,
        payoutTill: v.payoutTill,
      },
      create: v,
    });
  }

  const venueBySlug = new Map(
    (await prisma.venue.findMany({ select: { id: true, slug: true } })).map((v) => [v.slug, v.id])
  );
  const vid = (slug: string) => venueBySlug.get(slug) as string;

  // ───────── Events ─────────
  const events = [
    {
      slug: 'sunday-supper-club',
      title: 'Sunday Supper Club: Coastal Edition',
      category: 'Food & Drink Experiences',
      description:
        'A long-table feast celebrating Swahili coastal cuisine — six courses, live oud, no phones at the table.',
      startDate: dayUtc(9),
      endDate: dayUtc(9),
      city: 'Nairobi',
      venueId: vid('cinnabar-green-garden'),
      pricePerTicket: 4500,
      ticketsAvailable: 40,
      ticketsSold: 28,
      coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80',
      isFeatured: true,
      organizer: 'Nyama Collective',
    },
    {
      slug: 'rooftop-listening-party',
      title: 'Rooftop Listening Party: Vol. 4',
      category: 'Performance & Entertainment',
      description: 'Album premieres from three Nairobi artists, golden hour to midnight.',
      startDate: dayUtc(16),
      endDate: dayUtc(16),
      city: 'Nairobi',
      venueId: vid('the-alchemist-rooftop'),
      pricePerTicket: 2000,
      ticketsAvailable: 180,
      ticketsSold: 142,
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80',
      isFeatured: true,
      organizer: 'Sauti Sessions',
    },
    {
      slug: 'creative-founders-mixer',
      title: 'Creative Founders Mixer',
      category: 'Networking',
      description: 'Monthly mixer for creative founders and venue owners — drinks, demos, and dealmaking.',
      startDate: dayUtc(4),
      endDate: dayUtc(4),
      city: 'Nairobi',
      venueId: vid('the-mint-loft'),
      pricePerTicket: 1500,
      ticketsAvailable: 80,
      ticketsSold: 51,
      coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80',
      isFeatured: true,
      organizer: 'Spaces For you',
    },
    {
      slug: 'coast-sundowner-sessions',
      title: 'Coast Sundowner Sessions',
      category: 'Performance & Entertainment',
      description: 'Live afro-house on the deck as the sun drops over Tudor Creek.',
      startDate: dayUtc(23),
      endDate: dayUtc(23),
      city: 'Mombasa',
      venueId: vid('tamarind-dhow-deck'),
      pricePerTicket: 3000,
      ticketsAvailable: 120,
      ticketsSold: 64,
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80',
      isFeatured: false,
      organizer: 'Coast Collective',
    },
  ];

  for (const e of events) {
    await prisma.event.upsert({ where: { slug: e.slug }, update: { coverImage: e.coverImage }, create: e });
  }

  // ───────── Bookings ─────────
  // Spread across venues, guests, dates (relative to now) and statuses so the
  // Calendar / Bookings / Earnings / Payouts dashboards are all populated.
  const g = (i: number) => guests[i % guests.length].id;
  type Seed = {
    id: string;
    slug: string;
    userId: string;
    offset: number;
    start: string;
    end: string;
    guests: number;
    total: number;
    status: BookingStatus;
    payment: PaymentStatus;
    payout?: PayoutStatus;
    settledOffset?: number;
  };

  const bookings: Seed[] = [
    { id: 'seed-bk-01', slug: 'the-alchemist-rooftop', userId: g(0), offset: -21, start: '18:00', end: '23:00', guests: 120, total: 60000, status: BookingStatus.COMPLETED, payment: PaymentStatus.SUCCEEDED, payout: PayoutStatus.SETTLED, settledOffset: -18 },
    { id: 'seed-bk-02', slug: 'studio-kawi', userId: g(1), offset: -14, start: '09:00', end: '13:00', guests: 12, total: 26000, status: BookingStatus.COMPLETED, payment: PaymentStatus.SUCCEEDED, payout: PayoutStatus.SETTLED, settledOffset: -12 },
    { id: 'seed-bk-03', slug: 'tamarind-dhow-deck', userId: g(2), offset: -10, start: '16:00', end: '20:00', guests: 80, total: 40000, status: BookingStatus.COMPLETED, payment: PaymentStatus.SUCCEEDED, payout: PayoutStatus.SETTLED, settledOffset: -8 },
    { id: 'seed-bk-04', slug: 'cinnabar-green-garden', userId: g(3), offset: -3, start: '11:00', end: '15:00', guests: 40, total: 32000, status: BookingStatus.COMPLETED, payment: PaymentStatus.SUCCEEDED, payout: PayoutStatus.PENDING },
    { id: 'seed-bk-05', slug: 'the-mint-loft', userId: g(4), offset: -1, start: '14:00', end: '18:00', guests: 60, total: 36000, status: BookingStatus.COMPLETED, payment: PaymentStatus.SUCCEEDED, payout: PayoutStatus.PENDING },
    { id: 'seed-bk-06', slug: 'the-alchemist-rooftop', userId: g(1), offset: 1, start: '19:00', end: '23:30', guests: 150, total: 54000, status: BookingStatus.CONFIRMED, payment: PaymentStatus.SUCCEEDED, payout: PayoutStatus.PENDING },
    { id: 'seed-bk-07', slug: 'studio-kawi', userId: g(2), offset: 2, start: '10:00', end: '14:00', guests: 15, total: 26000, status: BookingStatus.CONFIRMED, payment: PaymentStatus.SUCCEEDED, payout: PayoutStatus.PENDING },
    { id: 'seed-bk-08', slug: 'tamarind-dhow-deck', userId: g(0), offset: 4, start: '15:00', end: '21:00', guests: 100, total: 60000, status: BookingStatus.CONFIRMED, payment: PaymentStatus.SUCCEEDED, payout: PayoutStatus.PENDING },
    { id: 'seed-bk-09', slug: 'cinnabar-green-garden', userId: g(3), offset: 7, start: '09:00', end: '12:00', guests: 30, total: 24000, status: BookingStatus.PENDING, payment: PaymentStatus.PENDING },
    { id: 'seed-bk-10', slug: 'the-mint-loft', userId: g(4), offset: 9, start: '13:00', end: '17:00', guests: 70, total: 36000, status: BookingStatus.CONFIRMED, payment: PaymentStatus.SUCCEEDED, payout: PayoutStatus.PENDING },
    { id: 'seed-bk-11', slug: 'lakeside-pavilion-kisumu', userId: g(1), offset: 12, start: '08:00', end: '16:00', guests: 220, total: 60000, status: BookingStatus.CONFIRMED, payment: PaymentStatus.SUCCEEDED, payout: PayoutStatus.PENDING },
    { id: 'seed-bk-12', slug: 'the-alchemist-rooftop', userId: g(2), offset: 5, start: '12:00', end: '15:00', guests: 40, total: 36000, status: BookingStatus.CANCELLED, payment: PaymentStatus.FAILED },
  ];

  for (const b of bookings) {
    const { commissionAmount, payoutAmount } = split(b.total);
    const data = {
      date: dayUtc(b.offset),
      startTime: b.start,
      endTime: b.end,
      guestCount: b.guests,
      totalAmount: b.total,
      status: b.status,
      paymentMethod: PaymentMethod.MPESA,
      paymentStatus: b.payment,
      paymentRef: b.payment === PaymentStatus.SUCCEEDED ? `SEED-${b.id.toUpperCase()}` : null,
      commissionAmount,
      payoutAmount,
      payoutStatus: b.payout ?? null,
      payoutAt: b.settledOffset != null ? dayUtc(b.settledOffset) : null,
      payoutRef: b.payout === PayoutStatus.SETTLED ? `B2C-${b.id.toUpperCase()}` : null,
      venueId: vid(b.slug),
      userId: b.userId,
    };
    await prisma.booking.upsert({ where: { id: b.id }, update: data, create: { id: b.id, ...data } });
  }

  // ───────── Ally applications ─────────
  await prisma.allyApplication.createMany({
    data: [
      {
        businessName: 'Mara House Nairobi',
        ownerName: 'Wanjiru Kimani',
        email: 'wanjiru@marahouse.co.ke',
        phone: '+254 712 345 678',
        city: 'Nairobi',
        address: 'Riverside Drive, Nairobi',
        venueType: 'Restaurant',
        description: 'A 60-seater contemporary Kenyan restaurant.',
        motivation: 'We want to be a place where everyone feels seen.',
        inclusivityPlan: 'Staff training, gender-neutral restrooms, sliding-scale community nights.',
      },
      {
        businessName: 'Lamu Soundroom',
        ownerName: 'Ali Bakari',
        email: 'ali@lamusoundroom.com',
        phone: '+254 733 998 776',
        city: 'Mombasa',
        address: 'Old Town, Lamu',
        venueType: 'Studio Space',
        description: 'Acoustic-treated 40-seater listening room and recording studio.',
        motivation: 'Building safer creative space on the coast.',
        inclusivityPlan: 'Code of conduct, anonymous reporting line, accessibility ramps.',
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Admin: ${admin.email} / admin123`);
  console.log(`✅ Owners: ${owner.email} / owner123  (+ ${owner2.email})`);
  console.log(`✅ Demo user: marleydeno83@gmail.com / demo1234`);
  console.log(`✅ ${venues.length} venues, ${events.length} events, ${guests.length} guests, ${bookings.length} bookings.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
