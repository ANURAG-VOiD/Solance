"use client";

import Link from "next/link";
import {
  Briefcase,
  FileText,
  MessageSquare,
  ClipboardList,
  Search,
  Plus,
  User,
  ArrowRight,
  Bell,
  CheckCircle2,
  DollarSign,
  Zap,
  Activity,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/shared/ui/Card";
import { Button } from "@/components/shared/ui/Button";
import { Badge } from "@/components/shared/ui/Badge";
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
import { useAuth, useWalletConnectionStatus } from "@/context/AuthContext";
import { truncateWallet } from "@/lib/utils";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const FREELANCER_QUICK_ACTIONS = [
  { href: "/marketplace",   label: "Browse Jobs",     icon: Search,       color: "brand" },
  { href: "/messages",      label: "Messages",        icon: MessageSquare, color: "violet" },
  { href: "/invoices",      label: "Invoices",        icon: FileText,      color: "teal" },
  { href: "/applications",  label: "Applications",    icon: ClipboardList, color: "success" },
  { href: "/profile",       label: "Profile",         icon: User,          color: "brand" },
];

const CLIENT_QUICK_ACTIONS = [
  { href: "/jobs/new",  label: "Post Job",      icon: Plus,          color: "brand" },
  { href: "/jobs",      label: "My Jobs",       icon: Briefcase,     color: "violet" },
  { href: "/messages",  label: "Messages",      icon: MessageSquare, color: "teal" },
  { href: "/invoices",  label: "Invoices",      icon: FileText,      color: "success" },
  { href: "/profile",   label: "Profile",       icon: User,          color: "brand" },
];

const notifIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  message: MessageSquare,
  invoice: DollarSign,
  job:     Briefcase,
  bid:     CheckCircle2,
  default: Bell,
};

type AccentColor = "brand" | "violet" | "teal" | "success";

export function DashboardOverview() {
  const role = useUiStore((s) => s.role);
  const { walletAddress } = useWalletConnectionStatus();
  const applications  = useMyApplications();
  const jobs          = useMyPostedJobs();
  const chats         = useChats();
  const invoices      = useInvoices();
  const dashboardStats = useDashboardStats();
  const notifications = useNotifications();

  const isStatsLoading =
    applications.isLoading || jobs.isLoading || chats.isLoading ||
    invoices.isLoading || dashboardStats.isLoading;
  const statsError =
    applications.error || jobs.error || chats.error ||
    invoices.error || dashboardStats.error;

  const pendingApps     = applications.data?.filter((a) => a.bid.status === "pending").length ?? 0;
  const openJobs        = jobs.data?.filter((j) => j.status === "open").length ?? 0;
  const pendingInvoices = invoices.data?.filter((i) => i.status === "pending").length ?? 0;

  const freelancerStats = [
    {
      label: "Applied Jobs",
      value: dashboardStats.data?.freelancer.applied_jobs ?? applications.data?.length ?? 0,
      icon: <ClipboardList className="h-5 w-5" />,
      accentColor: "brand" as AccentColor,
      delay: 0,
    },
    {
      label: "Active Contracts",
      value: dashboardStats.data?.freelancer.active_contracts ?? applications.data?.filter((a) => a.bid.status === "accepted").length ?? 0,
      icon: <Briefcase className="h-5 w-5" />,
      accentColor: "violet" as AccentColor,
      delay: 80,
    },
    {
      label: "Unread Messages",
      value: dashboardStats.data?.freelancer.unread_messages ?? chats.data?.length ?? 0,
      icon: <MessageSquare className="h-5 w-5" />,
      accentColor: "teal" as AccentColor,
      delay: 160,
    },
    {
      label: "Pending Invoices",
      value: dashboardStats.data?.freelancer.pending_invoices ?? pendingInvoices,
      icon: <FileText className="h-5 w-5" />,
      accentColor: "success" as AccentColor,
      delay: 240,
    },
  ];

  const clientStats = [
    {
      label: "Active Jobs",
      value: dashboardStats.data?.client.active_jobs ?? openJobs,
      icon: <Briefcase className="h-5 w-5" />,
      accentColor: "brand" as AccentColor,
      delay: 0,
    },
    {
      label: "Applications Received",
      value: dashboardStats.data?.client.applications_received ?? 0,
      icon: <ClipboardList className="h-5 w-5" />,
      accentColor: "violet" as AccentColor,
      delay: 80,
    },
    {
      label: "Ongoing Projects",
      value: dashboardStats.data?.client.ongoing_projects ?? chats.data?.length ?? 0,
      icon: <MessageSquare className="h-5 w-5" />,
      accentColor: "teal" as AccentColor,
      delay: 160,
    },
    {
      label: "Pending Payments",
      value: dashboardStats.data?.client.pending_payments ?? pendingInvoices,
      icon: <DollarSign className="h-5 w-5" />,
      accentColor: "success" as AccentColor,
      delay: 240,
    },
  ];

  const stats = role === "freelancer" ? freelancerStats : clientStats;
  const quickActions = role === "freelancer" ? FREELANCER_QUICK_ACTIONS : CLIENT_QUICK_ACTIONS;

  const colorMap: Record<string, string> = {
    brand:   "bg-brand/15 text-brand ring-brand/20",
    violet:  "bg-accent-violet/15 text-accent-violet ring-accent-violet/20",
    teal:    "bg-accent-teal/15 text-accent-teal ring-accent-teal/20",
    success: "bg-success/15 text-success ring-success/20",
  };

  return (
    <div className="animate-fade-in">
      {/* Greeting Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-brand" />
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            {role === "freelancer" ? "Freelancer" : "Client"} Dashboard
          </p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text">
          {getGreeting()}
          {walletAddress && (
            <span className="text-text-muted font-normal">
              {", "}
              <span className="font-mono text-xl text-text">{truncateWallet(walletAddress)}</span>
            </span>
          )}
        </h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Here's what's happening in your workspace today.
        </p>
      </div>

      {/* Action button */}
      <div className="mb-8 flex justify-end">
        {role === "freelancer" ? (
          <Link href="/marketplace">
            <Button>
              Browse marketplace <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link href="/jobs/new">
            <Button>
              <Plus className="h-4 w-4" /> Post a project
            </Button>
          </Link>
        )}
      </div>

      {/* Stat Cards */}
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
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              accentColor={s.accentColor}
              delay={s.delay}
            />
          ))}
        </div>
      )}

      {/* Bottom grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card variant="elevated">
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-semibold">Quick actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {quickActions.map(({ href, label, icon: Icon, color }) => (
              <Link key={href} href={href}>
                <div className="group flex flex-col items-center gap-2.5 rounded-xl border border-border/60 bg-surface-3 p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/20">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${colorMap[color]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-text-muted group-hover:text-text transition-colors">
                    {label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card variant="elevated">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand" />
              <h2 className="text-sm font-semibold">Recent activity</h2>
            </div>
            {notifications.items.length > 0 && (
              <Badge variant="brand" dot>{notifications.unreadCount} new</Badge>
            )}
          </div>

          {notifications.isLoading && <LoadingState label="Loading activity…" />}
          {!notifications.isLoading && notifications.error && (
            <ErrorState message={notifications.error} onRetry={notifications.reload} />
          )}
          {!notifications.isLoading && !notifications.error && notifications.items.length === 0 && (
            <EmptyState
              title="No recent activity"
              description="Activity appears here when new messages, bids, and invoice updates arrive."
            />
          )}
          {!notifications.isLoading && !notifications.error && notifications.items.length > 0 && (
            <ul className="space-y-1">
              {notifications.items.slice(0, 5).map((item, i) => {
                const type = item.type ?? "default";
                const Icon = notifIconMap[type] ?? notifIconMap.default;
                return (
                  <li
                    key={item.id}
                    className="animate-slide-in-left flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-surface-3"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 ring-1 ring-brand/20">
                      <Icon className="h-3.5 w-3.5 text-brand" />
                    </div>
                    <span className="text-text-muted flex-1 min-w-0 truncate">{item.title}</span>
                    {!item.read && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Pending apps note */}
      {role === "freelancer" && pendingApps > 0 && (
        <p className="mt-5 text-sm text-text-muted animate-fade-in">
          <span className="font-semibold text-brand">{pendingApps}</span> pending application{pendingApps !== 1 ? "s" : ""}.{" "}
          <Link href="/applications" className="text-brand hover:underline underline-offset-2">
            View all →
          </Link>
        </p>
      )}

      {/* Client — Published Jobs */}
      {role === "client" && !jobs.isLoading && !jobs.error && (jobs.data?.length ?? 0) > 0 && (
        <Card variant="elevated" className="mt-5">
          <div className="mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-semibold">Published jobs</h2>
          </div>
          <ul className="divide-y divide-border/40">
            {jobs.data?.slice(0, 5).map((job) => (
              <li key={job.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                  <span className="truncate text-text-muted">{job.title}</span>
                </div>
                <Link
                  href={`/jobs/${job.id}/applicants`}
                  className="ml-4 shrink-0 flex items-center gap-1 text-xs font-medium text-brand hover:underline underline-offset-2"
                >
                  Applicants <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
