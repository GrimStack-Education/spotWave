import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
 title: 'SpotWave',
 description: 'SpotWave social discovery platform',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return (
 <html lang="en" className={cn("h-full antialiased", "font-sans", geist.variable)}>
 <body className="min-h-full">
 <Providers>{children}</Providers>
 </body>
 </html>
 );
}
