import { Link, useRouteError } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export function ErrorBoundary() {
  const error = useRouteError() as Error | undefined;

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="heading-display text-3xl font-bold sm:text-4xl">
        Unexpected error
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        {error?.message ?? 'Something went wrong while loading this page.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/">
          <Button>Return to Home</Button>
        </Link>
        <Button variant="outline" onClick={() => location.reload()}>
          Try again
        </Button>
      </div>
    </Container>
  );
}
