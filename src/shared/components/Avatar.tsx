import { resolveAssetUrl } from "../api/http";
import { cn } from "../lib/cn";
import { initials } from "../lib/format";

interface AvatarProps {
  firstName: string;
  lastName: string;
  image?: string | null;
  /** Size, shape and text size, e.g. "h-8 w-8 rounded-full text-xs". */
  className?: string;
}

/** The person's photo, or their initials when they have none. */
export function Avatar({ firstName, lastName, image, className }: AvatarProps) {
  if (image) {
    return <img src={resolveAssetUrl(image)} alt="" className={cn("shrink-0 object-cover", className)} />;
  }
  return (
    <span className={cn("flex shrink-0 items-center justify-center bg-pine-800 font-bold text-white", className)} aria-hidden>
      {initials(firstName, lastName)}
    </span>
  );
}
