"use client";

import Link from "next/link";
import { Briefcase, FileText, MessageSquare, ClipboardList, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/shared/ui/Card";
import { Button } from "@/components/shared/ui/Button";
import { useUiStore } from "@/store/ui.store";
import { useMyApplications } from "@/hooks/useApplications";
import { useMyPostedJobs } from "@/hooks/useMyJobs";
import { useChats } from "@/hooks/useChats";
import { useInvoices } from "@/hooks/useInvoices";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useNotifications } from "@/hooks/useNotifications";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { EmptyState } from "@/components/shared/states/EmptyState";

export function DashboardOverview() {
  const role = useUiStore((s) => s.role);
  const applications = useMyApplications();
  const jobs = useMyPostedJobs();
  const chats = useChats();
  const invoices = useInvoices();
  const dashboardStats = useDashboardStats();
  const notifications = useNotifications();

  const isStatsLoading =
    applications.isLoading ||
    jobs.isLoading ||
    chats.isLoading ||
    invoices.isLoading ||
    dashboardStats.isLoading;
  const statsError =
    applications.error ||
    jobs.error ||
    chats.error ||
    invoices.error ||
    dashboardStats.error;

  const pendingApps = applications.data?.filter((a) => a.bid.status === "pending").length ?? 0;
  const openJobs = jobs.data?.filter((j) => j.status === "open").length ?? 0;
  const pendingInvoices = invoices.data?.filter((i) => i.status === "pending").length ?? 0;

  const freelancerStats = [
    { label: "Applied Jobs", value: dashboardStats.data?.freelancer.applied_jobs ?? applications.data?.length ?? 0, icon: <ClipboardList className="h-4 w-4 text-brand" /> },
    { label: "Active Contracts", value: dashboardStats.data?.freelancer.active_contracts ?? applications.data?.filter((a) => a.bid.status === "accepted").length ?? 0, icon: <Briefcase className="h-4 w-4 text-brand" /> },
    { label: "Unread Messages", value: dashboardStats.data?.freelancer.unread_messages ?? chats.data?.length ?? 0, icon: <MessageSquare className="h-4 w-4 text-brand" /> },
    { label: "Pending Invoices", value: dashboardStats.data?.freelancer.pending_invoices ?? pendingInvoices, icon: <FileText className="h-4 w-4 text-brand" /> },
  ];

  const clientStats = [
    { label: "Active Jobs", value: dashboardStats.data?.client.active_jobs ?? openJobs, icon: <Briefcase className="h-4 w-4 text-brand" /> },
    { label: "Applications Received", value: dashboardStats.data?.client.applications_received ?? 0, icon: <ClipboardList className="h-4 w-4 text-brand" /> },
    { label: "Ongoing Projects", value: dashboardStats.data?.client.ongoing_projects ?? chats.data?.length ?? 0, icon: <MessageSquare className="h-4 w-4 text-brand" /> },
    { label: "Pending Payments", value: dashboardStats.data?.client.pending_payments ?? pendingInvoices, icon: <FileText className="h-4 w-4 text-brand" /> },
  ];

  const stats = role === "freelancer" ? freelancerStats : clientStats;

  return (
    <div>
      <PageHeader
        title={role === "freelancer" ? "Freelancer Dashboard" : "Client Dashboard"}
        description="Overview of your workspace activity"
        actions={
          role === "freelancer" ? (
            <Link href="/marketplace"><Button>Browse marketplace</Button></Link>
          ) : (
            <Link href="/jobs/new"><Button>Post a project</Button></Link>
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isStatsLoading && <LoadingState label="Loading dashboard stats…" />}
        {!isStatsLoading && statsError && (
          <ErrorState
            message={statsError}
            onRetry={() => {
              applications.reload();
              jobs.reload();
              chats.reload();
              invoices.reload();
              dashboardStats.reload();
            }}
          />
        )}
        {!isStatsLoading && !statsError && (
          <>
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
        ))}
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold">Quick actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/messages"><Button variant="secondary" size="sm">Messages</Button></Link>
            <Link href="/invoices"><Button variant="secondary" size="sm">Invoices</Button></Link>
            <Link href="/profile"><Button variant="secondary" size="sm">Profile</Button></Link>
            {role === "freelancer" ? (
              <Link href="/applications"><Button variant="secondary" size="sm">Applications</Button></Link>
            ) : (
              <Link href="/jobs"><Button variant="secondary" size="sm">My jobs</Button></Link>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent activity</h2>
            <TrendingUp className="h-4 w-4 text-brand" />
          </div>
          {notifications.isLoading && <LoadingState label="Loading activity…" />}
          {!notifications.isLoading && notifications.error && (
            <ErrorState message={notifications.error} onRetry={notifications.reload} />
          )}
          {!notifications.isLoading &&
            !notifications.error &&
            notifications.items.length === 0 && (
              <EmptyState
                title="No recent activity"
                description="Activity appears here when new messages, bids, and invoice updates arrive."
              />
            )}
          {!notifications.isLoading &&
            !notifications.error &&
            notifications.items.length > 0 && (
              <ul className="space-y-2">
                {notifications.items.slice(0, 5).map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm text-text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    {item.title}
                  </li>
                ))}
              </ul>
            )}
        </Card>
      </div>

      {role === "freelancer" && pendingApps > 0 && (
        <p className="mt-4 text-sm text-text-muted">
          {pendingApps} pending application{pendingApps !== 1 ? "s" : ""}.{" "}
          <Link href="/applications" className="text-brand hover:underline">View all</Link>
        </p>
      )}

      {role === "client" && !jobs.isLoading && !jobs.error && (jobs.data?.length ?? 0) > 0 && (
        <Card className="mt-6">
          <h2 className="mb-3 text-sm font-semibold">Published jobs</h2>
          <ul className="divide-y divide-border">
            {jobs.data?.slice(0, 5).map((job) => (
              <li key={job.id} className="flex items-center justify-between py-2 text-sm">
                <span>{job.title}</span>
                <Link href={`/jobs/${job.id}/applicants`} className="text-brand hover:underline">Applicants</Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
