
import { GuestNavbar } from "./GuestNavbar";
import { Sidebar } from "./Sidebar";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function GuestContentLayout({ title, children }: ContentLayoutProps) {
  return (
    <div>
      <GuestNavbar title={title} />
      <div className="container pt-8 pb-8 px-4 sm:px-8]">{children}</div>
    </div>
  );
}
