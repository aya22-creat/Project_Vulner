import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <Header title="Settings" description="Configure your vulnerability scanner" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Configure the connection to your backend API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">API Base URL</Label>
              <Input
                id="apiUrl"
                placeholder="http://localhost:5000"
                className="bg-secondary border-border"
                defaultValue={process.env.NEXT_PUBLIC_API_BASE_URL || ""}
              />
              <p className="text-xs text-muted-foreground">Set via NEXT_PUBLIC_API_BASE_URL environment variable</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive scan notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Scan Complete Notifications</Label>
                <p className="text-xs text-muted-foreground">Get notified when a scan completes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Vulnerability Alerts</Label>
                <p className="text-xs text-muted-foreground">Get alerted when vulnerabilities are found</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Scan Defaults</CardTitle>
            <CardDescription>Default settings for new scans</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultBranch">Default Branch</Label>
              <Input id="defaultBranch" placeholder="main" defaultValue="main" className="bg-secondary border-border" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-refresh Running Scans</Label>
                <p className="text-xs text-muted-foreground">Automatically poll for updates on running scans</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>Save Settings</Button>
        </div>
      </div>
    </div>
  )
}
