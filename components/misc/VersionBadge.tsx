"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  APP_BUILT_AT,
  APP_COMMIT,
  APP_VERSION,
  fetchApiVersion,
  type ApiVersion,
} from "@/lib/version";
import { useEffect, useState } from "react";

const formatDate = (value: string | null) => {
  if (!value) return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleString();
};

const VersionBadge = () => {
  const [api, setApi] = useState<ApiVersion | null>(null);
  const [unreachable, setUnreachable] = useState(false);

  useEffect(() => {
    let active = true;

    fetchApiVersion()
      .then((data) => active && setApi(data))
      .catch(() => active && setUnreachable(true));

    return () => {
      active = false;
    };
  }, []);

  // Sin respuesta del backend no se puede afirmar que haya desfase, solo que
  // no se pudo comprobar.
  const mismatch = api !== null && api.version !== APP_VERSION;
  const builtAt = formatDate(APP_BUILT_AT);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="text-xs text-muted-foreground tabular-nums cursor-default">
            v{APP_VERSION}
            {mismatch && (
              <span className="ml-1 text-amber-600 dark:text-amber-500">
                · API v{api.version}
              </span>
            )}
          </p>
        </TooltipTrigger>

        <TooltipContent className="text-xs">
          <div className="flex flex-col gap-0.5">
            <span>
              Interfaz v{APP_VERSION}
              {APP_COMMIT && ` (${APP_COMMIT})`}
            </span>

            {api && (
              <span>
                API v{api.version}
                {api.commit && ` (${api.commit})`}
              </span>
            )}

            {unreachable && <span>API sin respuesta</span>}

            {builtAt && <span>Compilado: {builtAt}</span>}

            {mismatch && (
              <span className="text-amber-500">
                Interfaz y API en versiones distintas
              </span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VersionBadge;
