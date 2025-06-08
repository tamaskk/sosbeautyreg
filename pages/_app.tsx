import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <>
      <div className="min-h-screen flex flex-col">
        {!isAdminPage && <Navbar />}
        <main className="flex-grow">
          {isAdminPage ? (
            <div className="min-h-screen bg-gray-100">
              <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16">
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center">
                        <span className="text-xl font-bold text-gray-900">SOS Beauty Admin</span>
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
              <main className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                  <Component {...pageProps} />
                </div>
              </main>
            </div>
          ) : (
            <Component {...pageProps} />
          )}
        </main>
        <Footer />
      </div>
      <Toaster position="top-center" />
    </>
  );
} 