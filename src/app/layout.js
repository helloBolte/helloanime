import { Inter } from "next/font/google";
import "./globals.css";
import ScrollAwareLayout from "@/components/ScrollAwareLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HelloAnime",
  description: "A modern anime streaming platform for kids and teens",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-hidden`}>
        <ScrollAwareLayout>{children}</ScrollAwareLayout>
      </body>
    </html>
  );
}
