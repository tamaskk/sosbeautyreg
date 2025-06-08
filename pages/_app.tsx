import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/router';
import { appWithTranslation } from 'next-i18next';
import { SessionProvider } from 'next-auth/react';
import CookieConsent from '../components/CookieConsent';

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex flex-col">
        {!isAdminPage && <Navbar />}
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
      <Toaster position="top-center" />
      <CookieConsent />
    </SessionProvider>
  );
}

export default appWithTranslation(App); 