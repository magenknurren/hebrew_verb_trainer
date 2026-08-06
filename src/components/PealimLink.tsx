interface PealimLinkProps {
  url: string;
  label: string;
}

export function PealimLink({ url, label }: PealimLinkProps) {
  return (
    <a
      href={url}
      className="pealim-link"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
    >
      ↗
    </a>
  );
}
