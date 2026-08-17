"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface PageTitleContextType {
  title: string;
  registerTitle: (title: string) => () => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(
  undefined
);

export const PageTitleProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState("");

  const stackRef = useRef<{ id: number; title: string }[]>([]);
  const idRef = useRef(0);

  const sync = useCallback(() => {
    const top = stackRef.current[stackRef.current.length - 1];
    setTitle(top?.title ?? "");
  }, []);

  const registerTitle = useCallback(
    (nextTitle: string) => {
      const id = ++idRef.current;

      stackRef.current = [
        ...stackRef.current.filter((entry) => entry.id !== id),
        { id, title: nextTitle },
      ];

      sync();

      return () => {
        stackRef.current = stackRef.current.filter(
          (entry) => entry.id !== id
        );
        sync();
      };
    },
    [sync]
  );

  const value = useMemo(
    () => ({ title, registerTitle }),
    [title, registerTitle]
  );

  return (
    <PageTitleContext.Provider value={value}>
      {children}
    </PageTitleContext.Provider>
  );
};

export const usePageTitle = (): PageTitleContextType => {
  const ctx = useContext(PageTitleContext);
  if (!ctx) {
    throw new Error("usePageTitle must be used within PageTitleProvider");
  }
  return ctx;
};
