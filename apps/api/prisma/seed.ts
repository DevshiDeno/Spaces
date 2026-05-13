/* eslint-disable no-console */
import { PrismaClient, NoiseLevel, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database…');

  // Admin user
  const passwordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@qreativespaces.co.ke' },
    update: {},
    create: {
      email: 'admin@qreativespaces.co.ke',
      name: 'Qreative Admin',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  // Sample space owner
  const ownerPasswordHash = await bcrypt.hash('owner123', 12);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@qreativespaces.co.ke' },
    update: {},
    create: {
      email: 'owner@qreativespaces.co.ke',
      name: 'Wanjiru Kimani',
      passwordHash: ownerPasswordHash,
      role: UserRole.SPACE_OWNER,
      isSpaceOwner: true,
    },
  });

  // Demo user (matches the frontend mock)
  const userPasswordHash = await bcrypt.hash('demo1234', 12);
  await prisma.user.upsert({
    where: { email: 'simon@mzizi.co.ke' },
    update: {},
    create: {
      email: 'simon@mzizi.co.ke',
      name: 'Simon Otieno',
      passwordHash: userPasswordHash,
      role: UserRole.USER,
    },
  });

  // Venues
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
      coverImage: '/images/venue-1.jpg',
      images: ['/images/venue-1.jpg', '/images/venue-2.jpg', '/images/venue-3.jpg'],
      amenities: ['Sound System', 'Lighting', 'Bar', 'Wheelchair Accessible', 'Gender-neutral restrooms'],
      moods: ['Energetic', 'Creative'],
      bestFor: ['Listening parties', 'Brand launches', 'Cocktail parties'],
      noiseLevel: NoiseLevel.LOUD,
      timeOfDay: ['Evening'],
      isVerified: true,
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
      coverImage: '/images/venue-2.jpg',
      images: ['/images/venue-2.jpg', '/images/venue-1.jpg', '/images/venue-3.jpg'],
      amenities: ['Garden seating', 'Catering kitchen', 'Parking', 'Power backup'],
      moods: ['Relaxed', 'Intimate'],
      bestFor: ['Breathwork sessions', 'Private dinners', 'Wellness circles'],
      noiseLevel: NoiseLevel.QUIET,
      timeOfDay: ['Morning', 'Afternoon'],
      isVerified: true,
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
      coverImage: '/images/venue-3.jpg',
      images: ['/images/venue-3.jpg', '/images/venue-1.jpg', '/images/venue-2.jpg'],
      amenities: ['Cyclorama', 'Continuous lighting', 'Dressing room', 'Loading bay'],
      moods: ['Creative'],
      bestFor: ['Photoshoots', 'Lookbook shoots', 'Podcast recordings'],
      noiseLevel: NoiseLevel.MODERATE,
      timeOfDay: ['Morning', 'Afternoon', 'Evening'],
      isVerified: true,
    },
  ];

  for (const v of venues) {
    await prisma.venue.upsert({
      where: { slug: v.slug },
      update: {},
      create: { ...v, ownerId: owner.id },
    });
  }

  const alchemist = await prisma.venue.findUnique({ where: { slug: 'the-alchemist-rooftop' } });
  const cinnabar = await prisma.venue.findUnique({ where: { slug: 'cinnabar-green-garden' } });

  // Events
  const events = [
    {
      slug: 'sunday-supper-club',
      title: 'Sunday Supper Club: Coastal Edition',
      category: 'Food & Drink Experiences',
      description:
        'A long-table feast celebrating Swahili coastal cuisine — six courses, live oud, no phones at the table.',
      startDate: new Date('2026-05-24T18:00:00+03:00'),
      endDate: new Date('2026-05-24T22:00:00+03:00'),
      city: 'Nairobi',
      venueId: cinnabar?.id ?? null,
      pricePerTicket: 4500,
      ticketsAvailable: 40,
      ticketsSold: 28,
      coverImage: '/images/venue-2.jpg',
      isFeatured: true,
      organizer: 'Qreative Kitchen Collective',
    },
    {
      slug: 'rooftop-listening-party',
      title: 'Rooftop Listening Party: Vol. 4',
      category: 'Performance & Entertainment',
      description: 'Album premieres from three Nairobi artists, golden hour to midnight.',
      startDate: new Date('2026-06-14T17:00:00+03:00'),
      endDate: new Date('2026-06-14T23:30:00+03:00'),
      city: 'Nairobi',
      venueId: alchemist?.id ?? null,
      pricePerTicket: 2000,
      ticketsAvailable: 180,
      ticketsSold: 142,
      coverImage: '/images/venue-1.jpg',
      isFeatured: true,
      organizer: 'Qreative Sound',
    },
  ];

  for (const e of events) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: {},
      create: e,
    });
  }

  // Ally applications
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

  console.log(`✅ Seeded admin: ${admin.email} / admin123`);
  console.log(`✅ Seeded owner: ${owner.email} / owner123`);
  console.log(`✅ Seeded demo user: simon@mzizi.co.ke / demo1234`);
  console.log(`✅ Seeded ${venues.length} venues and ${events.length} events.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
