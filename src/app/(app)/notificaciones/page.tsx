"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { NotificationDetailSheet } from "@/components/notifications/notification-detail-sheet";
import { usePawFinder } from "@/context/pawfinder-context";
import { notificationKindLabel } from "@/lib/mock-notifications";
import type { AppNotification } from "@/lib/mock-notifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Inbox, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function NotificationRow({
  item,
  onSelect,
}: {
  item: AppNotification;
  onSelect: () => void;
}) {
  const isSponsor = item.kind === "sponsor";
  const kindLabel = isSponsor
    ? item.sponsorBadge ?? "Oferta"
    : notificationKindLabel(item.kind);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border border-border/50 bg-card/90 px-4 py-3.5 text-left shadow-sm transition-colors hover:bg-muted/40",
        !item.read && "border-primary/20 bg-primary/[0.04]",
        isSponsor && "border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {isSponsor ? (
            <Badge
              variant="secondary"
              className="border-amber-200/80 bg-amber-100/80 text-amber-950 dark:bg-amber-900/50 dark:text-amber-50"
            >
              <Sparkles className="size-3" data-icon="inline-start" />
              {kindLabel}
            </Badge>
          ) : (
            <Badge variant="outline" className="font-medium">
              {kindLabel}
            </Badge>
          )}
          {!item.read ? (
            <span className="size-2 rounded-full bg-primary" aria-label="Sin leer" />
          ) : null}
        </div>
        <span className="shrink-0 text-[0.7rem] text-muted-foreground">
          {item.createdAt}
        </span>
      </div>
      <p className="mt-2 font-heading text-base font-semibold leading-snug text-foreground">
        {item.title}
      </p>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {item.body}
      </p>
    </button>
  );
}

export default function NotificacionesPage() {
  const {
    notifications,
    markNotificationRead,
    clearAllNotifications,
    resetNotificationsDemo,
  } = usePawFinder();
  const [selected, setSelected] = useState<AppNotification | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const communityNotifications = notifications.filter(
    (item) => item.kind !== "sponsor",
  );
  const sponsorNotifications = notifications.filter(
    (item) => item.kind === "sponsor",
  );

  const openDetail = (item: AppNotification) => {
    markNotificationRead(item.id);
    setSelected(item);
    setSheetOpen(true);
  };

  return (
    <>
      <AppHeader
        title="Notificaciones"
        subtitle="Matches, confirmaciones y novedades de auspiciantes"
        showNotificationBell={false}
      />
      <div className="space-y-4 px-4 py-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-16 text-center">
            <div className="pf-empty-icon mb-4">
              <Inbox className="size-8 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-xl font-semibold">
              No tenés novedades
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Cuando haya un match, alguien marque «Puede ser» o una oferta de un
              auspiciante, vas a verlo acá.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={resetNotificationsDemo}
            >
              <Bell className="size-4" />
              Restaurar demo
            </Button>
          </div>
        ) : (
          <>
            {communityNotifications.length > 0 ? (
              <section className="space-y-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold">
                    Actividad importante
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Coincidencias, mensajes y confirmaciones de tus avisos
                  </p>
                </div>
                <ul className="space-y-3" aria-label="Actividad importante">
                  {communityNotifications.map((item) => (
                    <li key={item.id}>
                      <NotificationRow
                        item={item}
                        onSelect={() => openDetail(item)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {sponsorNotifications.length > 0 ? (
              <section className="space-y-3 border-t border-border/50 pt-4">
                <div>
                  <h2 className="font-heading text-base font-semibold">
                    Beneficios de la comunidad
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Contenido promocional separado de las alertas
                  </p>
                </div>
                <ul className="space-y-3" aria-label="Beneficios y promociones">
                  {sponsorNotifications.map((item) => (
                    <li key={item.id}>
                      <NotificationRow
                        item={item}
                        onSelect={() => openDetail(item)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              className="mx-auto text-muted-foreground"
              onClick={clearAllNotifications}
            >
              Limpiar lista (demo vacío)
            </Button>
          </>
        )}
      </div>
      <NotificationDetailSheet
        notification={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
