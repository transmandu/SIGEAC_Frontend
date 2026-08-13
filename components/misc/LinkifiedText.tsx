import { Fragment } from 'react';
import { cn } from '@/lib/utils';

// La puntuación final suele ser del texto, no de la URL: "(ver http://x.com)." o "http://x.com,"
const URL_REGEX = /((?:https?:\/\/|www\.)[^\s<]+)/gi;
const TRAILING_PUNCTUATION = /[.,;:!?)\]}"']+$/;

const splitTrailingPunctuation = (raw: string): [string, string] => {
  const match = raw.match(TRAILING_PUNCTUATION);
  if (!match) return [raw, ''];

  let cut = raw.length - match[0].length;
  // Un paréntesis de cierre pertenece a la URL si cierra uno abierto dentro de ella
  while (
    cut < raw.length &&
    raw[cut] === ')' &&
    (raw.slice(0, cut).match(/\(/g)?.length ?? 0) >
      (raw.slice(0, cut).match(/\)/g)?.length ?? 0)
  ) {
    cut++;
  }

  return [raw.slice(0, cut), raw.slice(cut)];
};

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

const LinkifiedText = ({ text, className }: LinkifiedTextProps) => {
  const parts = text.split(URL_REGEX);

  return (
    <span className={cn('break-words', className)}>
      {parts.map((part, index) => {
        // Los índices impares son las capturas del regex, es decir las URLs
        if (index % 2 === 0 || !part) return <Fragment key={index}>{part}</Fragment>;

        const [url, trailing] = splitTrailingPunctuation(part);
        // Sin protocolo el href sería relativo y navegaría dentro de la app
        const href = /^www\./i.test(url) ? `https://${url}` : url;

        return (
          <Fragment key={index}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2 decoration-primary/40 hover:decoration-primary transition-colors break-words"
            >
              {url}
            </a>
            {trailing}
          </Fragment>
        );
      })}
    </span>
  );
};

export default LinkifiedText;
