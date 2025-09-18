import type { SVGProps } from 'react';

export function KalaaVerseLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 30"
      width="120"
      height="30"
      {...props}
    >
      <style>
        {
          '.font-headline { font-family: var(--font-belleza), sans-serif; font-size: 24px; }'
        }
      </style>
      <text x="0" y="22" className="font-headline fill-primary" fill="hsl(var(--primary))">
        kalaaVerse
      </text>
    </svg>
  );
}
