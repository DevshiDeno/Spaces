import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { useThemeStore } from '@/store/theme.store';

export default function DashboardSettingsPage() {
  const { theme, toggleTheme } = useThemeStore();

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
            <CardDescription>Customize how Qreative Spaces looks for you.</CardDescription>
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
            {['Booking confirmations', 'New ally applications', 'Weekly performance digest'].map((label) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-border p-4">
                <p className="text-sm font-medium">{label}</p>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
