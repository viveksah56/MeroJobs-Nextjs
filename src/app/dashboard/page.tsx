import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Mero Jobs',
  description: 'Your personal dashboard at Mero Jobs',
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-4">Dashboard</h1>
        <p className="text-muted-foreground mb-8">Welcome to your Mero Jobs dashboard. Your authenticated access is working perfectly.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-6 rounded-lg border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-2">Saved Jobs</h2>
            <p className="text-sm text-muted-foreground">View and manage your saved job postings</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-2">Applications</h2>
            <p className="text-sm text-muted-foreground">Track your job applications and status</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-2">Profile</h2>
            <p className="text-sm text-muted-foreground">Update your personal information</p>
          </div>
        </div>
      </div>
    </main>
  );
}
