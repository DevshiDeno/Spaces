import { useState } from 'react';
import { FileText, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  updatedAt: string;
}

const mockPages: Page[] = [
  { id: 'p1', title: 'Homepage', slug: '/', status: 'published', updatedAt: '2026-04-12' },
  { id: 'p2', title: 'About Us', slug: '/about', status: 'published', updatedAt: '2026-04-08' },
  { id: 'p3', title: 'Become an Ally', slug: '/become-an-ally', status: 'published', updatedAt: '2026-03-29' },
  { id: 'p4', title: 'New community guidelines', slug: '/guidelines', status: 'draft', updatedAt: '2026-05-04' },
];

export default function DashboardPagesPage() {
  const [query, setQuery] = useState('');
  const filtered = mockPages.filter((p) =>
    `${p.title} ${p.slug}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl font-bold tracking-tight">Pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage CMS pages for your public site.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>Create New Page</Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <Input
          placeholder="Search pages..."
          leftIcon={<Search className="h-4 w-4" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileText className="h-6 w-6" />} title="No pages found" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Slug</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Updated</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-muted/30">
                  <td className="p-4 font-medium">{p.title}</td>
                  <td className="p-4 text-muted-foreground">{p.slug}</td>
                  <td className="p-4">
                    <Badge variant={p.status === 'published' ? 'success' : 'warning'}>
                      {p.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">Updated {p.updatedAt}</td>
                  <td className="p-4 text-right">
                    <Button size="sm" variant="ghost">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
