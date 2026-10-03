import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarX, Users } from "lucide-react";
import { cancelBooking, listMyBookings } from "./api";
import { extractErrorMessage } from "../../shared/api/httpClient";
import { Button } from "../../shared/components/ui/Button";
import { Badge } from "../../shared/components/ui/Badge";
import { CategoryBadge } from "../../shared/components/CategoryBadge";
import { Skeleton } from "../../shared/components/ui/Skeleton";
import { EmptyState } from "../../shared/components/ui/EmptyState";
import { Alert } from "../../shared/components/ui/Alert";
import { cn } from "../../shared/lib/cn";
import type { BookingStatus } from "../../shared/api/types";

const STATUS_CLASSES: Record<BookingStatus, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-neutral-100 text-neutral-500",
  COMPLETED: "bg-sky-50 text-sky-700",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};

export function MyBookingsPage() {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: listMyBookings,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-bookings"] }),
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-neutral-900">Mes réservations</h1>

      <div className="mt-6 space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        )}

        {isError && <Alert variant="error">Impossible de charger vos réservations.</Alert>}

        {bookings && bookings.length === 0 && (
          <EmptyState icon={CalendarX} title="Aucune réservation pour le moment" description="Parcourez les annonces et réservez votre premier séjour, location ou expérience." />
        )}

        {bookings?.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 p-4">
            <div className="space-y-1.5">
              <p className="font-semibold text-neutral-900">{booking.startDate} → {booking.endDate}</p>
              <p className="flex items-center gap-1.5 text-sm text-neutral-500">
                <Users className="size-3.5" />
                {booking.quantity}
                <span className="text-neutral-300">•</span>
                {booking.totalPrice} {booking.currency}
              </p>
              <div className="flex items-center gap-2">
                <CategoryBadge listingType={booking.listingType} />
                <Badge className={cn(STATUS_CLASSES[booking.status])}>{STATUS_LABELS[booking.status]}</Badge>
              </div>
            </div>
            {booking.status === "CONFIRMED" && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => cancelMutation.mutate(booking.id)}
                loading={cancelMutation.isPending && cancelMutation.variables === booking.id}
              >
                Annuler
              </Button>
            )}
          </div>
        ))}

        {cancelMutation.isError && <Alert variant="error">{extractErrorMessage(cancelMutation.error)}</Alert>}
      </div>
    </div>
  );
}
