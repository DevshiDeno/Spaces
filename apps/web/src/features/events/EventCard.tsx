import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/format';
import type { AppEvent } from '@/types';

interface EventCardProps {
  event: AppEvent;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const remaining = event.ticketsAvailable - event.ticketsSold;
  const soldOut = remaining <= 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
    >
      <Link to={`/events/${event.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={event.coverImage}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <Badge variant="accent" className="bg-white/95 backdrop-blur">{event.category}</Badge>
            {soldOut && <Badge variant="warning" className="bg-white/95 backdrop-blur">Sold Out</Badge>}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-base font-semibold tracking-tight">{event.title}</h3>
          <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(event.startDate, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {event.venueName ?? event.city}
            </span>
          </div>
          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                <Ticket className="h-4 w-4 text-primary" />
                {formatCurrency(event.pricePerTicket)}
              </span>
              <span className="text-xs text-muted-foreground">
                {soldOut ? 'Sold out' : `${remaining} left`}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="skeleton aspect-[16/10] w-full rounded-none" />
      <div className="space-y-2 p-5">
        <div className="skeleton h-5 w-4/5" />
        <div className="skeleton h-3 w-2/3" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}
