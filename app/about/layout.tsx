import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aaron Teklu - Developer & Writer",
  description: "Software developer exploring crypto and building cool things. Check out my projects and writings.",
  openGraph: {
    title: "Aaron Teklu - Developer & Writer",
    description: "Crypto, code, and whatever else keeps me up at night.",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

