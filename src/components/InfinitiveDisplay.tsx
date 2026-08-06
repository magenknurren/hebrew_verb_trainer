import { PealimLink } from "./PealimLink";

interface InfinitiveDisplayProps {
  hebrew: string;
  pealimUrl: string;
  pealimLabel: string;
}

export function InfinitiveDisplay({
  hebrew,
  pealimUrl,
  pealimLabel,
}: InfinitiveDisplayProps) {
  return (
    <span className="infinitive-with-link">
      <span className="hebrew infinitive-he" dir="rtl" lang="he">
        {hebrew}
      </span>
      <PealimLink url={pealimUrl} label={pealimLabel} />
    </span>
  );
}
