import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { createReview, listReviews } from "./api";
import { useAuthStore } from "../../shared/stores/authStore";
import { extractErrorMessage } from "../../shared/api/httpClient";
import { Button } from "../../shared/components/ui/Button";
import { Textarea } from "../../shared/components/ui/Field";
import { Alert } from "../../shared/components/ui/Alert";
import { cn } from "../../shared/lib/cn";
import type { ListingType } from "../../shared/api/types";

function StarRating({ value, onChange }: { value: number; onChange?: (value: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={cn(!onChange && "cursor-default")}
        >
          <Star className={cn("size-4", star <= value ? "fill-amber-400 text-amber-400" : "text-neutral-300")} />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ listingType, listingId }: { listingType: ListingType; listingId: string }) {
  const role = useAuthStore((state) => state.role);
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: reviews } = useQuery({
    queryKey: ["reviews", listingType, listingId],
    queryFn: () => listReviews(listingType, listingId),
  });

  const mutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", listingType, listingId] });
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate({ listingType, listingId, rating, comment });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">Avis</h2>

      {reviews && reviews.length === 0 && <p className="text-sm text-neutral-500">Aucun avis pour le moment.</p>}

      <div className="space-y-3">
        {reviews?.map((review) => (
          <div key={review.id} className="rounded-xl border border-neutral-200 p-3">
            <StarRating value={review.rating} />
            {review.comment && <p className="mt-1.5 text-sm text-neutral-700">{review.comment}</p>}
          </div>
        ))}
      </div>

      {role === "CUSTOMER" && (
        <form className="space-y-2 rounded-xl border border-neutral-200 p-3" onSubmit={handleSubmit}>
          <p className="text-sm font-medium text-neutral-700">Laisser un avis</p>
          <StarRating value={rating} onChange={setRating} />
          <Textarea rows={2} placeholder="Votre commentaire..." value={comment}
                    onChange={(e) => setComment(e.target.value)} />
          <Button type="submit" size="sm" loading={mutation.isPending}>Publier l'avis</Button>
          {mutation.isError && <Alert variant="error">{extractErrorMessage(mutation.error)}</Alert>}
          {mutation.isSuccess && <Alert variant="success">Merci pour votre avis !</Alert>}
        </form>
      )}
    </div>
  );
}
