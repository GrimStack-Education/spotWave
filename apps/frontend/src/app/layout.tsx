import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
 title: 'SpotWave',
 description: 'SpotWave social discovery platform',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return (
 <html lang="en" className="h-full antialiased">
 <body className="min-h-full">
 <Providers>{children}</Providers>
 </body>
 </html>
 );
}
