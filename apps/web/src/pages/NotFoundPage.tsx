import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function NotFoundPage() {
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
      <h1 className="heading-display mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
        Page Not Found
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/"><Button>Go Home</Button></Link>
        <Link to="/venues"><Button variant="outline">Browse Venues</Button></Link>
      </div>
    </Container>
  );
}
