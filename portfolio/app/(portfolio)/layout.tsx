import type { Metadata, Viewport } from "next";
import "./portfolio.css";

export const metadata: Metadata = {
  title: "YOUR NAME — Backend × AI Engineer",
  description:
    "Portfolio of a backend and AI engineer building thoughtful software, reliable systems, and useful AI products.",
};

export const viewport: Viewport = {
  themeColor: "#f4d52f",
};

export default function PortfolioLayout({ children }: LayoutProps<"/">) {
  return <>{children}</>;
}
