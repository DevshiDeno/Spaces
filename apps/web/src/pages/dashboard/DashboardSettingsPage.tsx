import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { useThemeStore } from '@/store/theme.store';
import { useToast } from '@/hooks/useToast';

interface NotificationPrefs {
  bookingConfirmations: boolean;
  newAllyApplications: boolean;
  weeklyDigest: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  bookingConfirmations: true,
  newAllyApplications: true,
  weeklyDigest: true,
};

const STORAGE_KEY = 'qs-notification-prefs';

function loadPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export default function DashboardSettingsPage() {
  const { theme, toggleTheme } = useThemeStore();
  const toast = useToast();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  function update<K extends keyof NotificationPrefs>(key: K, value: NotificationPrefs[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
    setDirty(true);
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      setDirty(false);
      toast.success('Preferences saved');
    } catch {
      toast.error('Could not save preferences');
    }
  }

  const rows: Array<{ key: keyof NotificationPrefs; label: string }> = [
    { key: 'bookingConfirmations', label: 'Booking confirmations' },
    { key: 'newAllyApplications', label: 'New ally applications' },
    { key: 'weeklyDigest', label: 'Weekly performance digest' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your preferences and platform configuration.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how Spaces For you looks for you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Use a darker theme across the app.</p>
              </div>
              <Switch checked={theme === 'dark'} onChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Decide what we should email you about.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-border p-4">
                <p className="text-sm font-medium">{label}</p>
                <Switch
                  checked={prefs[key]}
                  onChange={(e) => update(key, e.target.checked)}
                />
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={save} disabled={!dirty}>
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
