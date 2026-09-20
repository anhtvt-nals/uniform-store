import { Badge } from "@/components/ui/badge";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.967 6.817H1.681l7.73-8.835L1.255 2.25h6.826l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function ArticleShareLinks({
  facebookHref,
  xHref,
}: {
  facebookHref: string;
  xHref: string;
}) {
  return (
    <div className="mb-8 flex items-center gap-2 text-sm">
      <span className="mr-1 text-muted-foreground">Chia sẻ:</span>
      <a
        href={facebookHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chia sẻ bài viết trên Facebook"
      >
        <Badge className="bg-[#1877F2] text-white hover:bg-[#1877F2]/90">
          <FacebookIcon />
          Facebook
        </Badge>
      </a>
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chia sẻ bài viết trên X"
      >
        <Badge className="bg-foreground text-background hover:bg-foreground/90">
          <XIcon />
          X
        </Badge>
      </a>
    </div>
  );
}
