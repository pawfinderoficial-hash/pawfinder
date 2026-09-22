"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { AppNotification } from "@/lib/mock-notifications";
import { notificationKindLabel } from "@/lib/mock-notifications";
import { Sparkles } from "lucide-react";

interface NotificationDetailSheetProps {
  notification: AppNotification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationDetailSheet({
  notification,
  open,
  onOpenChange,
}: NotificationDetailSheetProps) {
  if (!notification) return null;

  const isSponsor = notification.kind === "sponsor";
  const sponsorBadge =
    notification.sponsorBadge ??
    (isSponsor ? notificationKindLabel("sponsor") : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-3xl">
        <SheetHeader className="text-left">
          <div className="flex flex-wrap items-center gap-2 pr-8">
            {isSponsor ? (
              <Badge
                variant="secondary"
                className="border-amber-200/80 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
              >
                <Sparkles className="size-3" data-icon="inline-start" />
                {sponsorBadge}
              </Badge>
            ) : (
              <Badge variant="outline">{notificationKindLabel(notification.kind)}</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {notification.createdAt}
            </span>
          </div>
          <SheetTitle className="font-heading text-xl font-semibold leading-snug">
            {notification.title}
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            {notification.body}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <p className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-sm leading-relaxed text-foreground/90">
            {notification.detail}
          </p>
          {notification.sponsorName ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Auspiciante: {notification.sponsorName}
            </p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
