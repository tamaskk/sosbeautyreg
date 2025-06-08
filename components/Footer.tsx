import Link from 'next/link';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Footer() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadPDF = async (type: string) => {
    if (downloading) return; // Prevent multiple downloads

    setDownloading(type);
    try {
      const response = await fetch(`/api/download-policy?type=${type}`);
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        // Try to get detailed error message from response
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || errorData?.message || `Download failed: ${response.status} ${response.statusText}`);
      }

      // Check if we got a PDF
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Invalid response format: Expected PDF');
      }

      // Create a blob from the response
      const blob = await response.blob();
      
      // Verify blob size
      if (blob.size === 0) {
        throw new Error('Received empty PDF file');
      }
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = type === 'privacy' ? 'adatvedelmi-nyilatkozat.pdf' :
                     type === 'terms' ? 'altalanos-szerzodesi-feltetelek.pdf' :
                     'cookie-szabalyzat.pdf';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error(error instanceof Error ? error.message : 'A PDF letöltése sikertelen');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">SOS Beauty</h3>
            <p className="text-sm">
              Segítünk megtalálni a legjobb szépségipari szolgáltatókat az Ön környékén.
            </p>
            <p className="text-sm">
              Email: sosbeauty@outlook.hu
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Gyors Linkek</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-white transition-colors">
                  Főoldal
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm hover:text-white transition-colors">
                  Regisztráció
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-white transition-colors">
                  Kapcsolat
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Jogi Információk</h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-between">
                <Link href="/privacy-policy" className="text-sm hover:text-white transition-colors">
                  Adatvédelmi Nyilatkozat
                </Link>
                <button
                  onClick={() => downloadPDF('privacy')}
                  disabled={downloading !== null}
                  className="text-xs text-indigo-400 hover:text-indigo-300 ml-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {downloading === 'privacy' ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      PDF
                    </>
                  ) : (
                    'PDF ↓'
                  )}
                </button>
              </li>
              <li className="flex items-center justify-between">
                <Link href="/terms" className="text-sm hover:text-white transition-colors">
                  Általános Szerződési Feltételek
                </Link>
                <button
                  onClick={() => downloadPDF('terms')}
                  disabled={downloading !== null}
                  className="text-xs text-indigo-400 hover:text-indigo-300 ml-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {downloading === 'terms' ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      PDF
                    </>
                  ) : (
                    'PDF ↓'
                  )}
                </button>
              </li>
              <li className="flex items-center justify-between">
                <Link href="/cookies" className="text-sm hover:text-white transition-colors">
                  Cookie Szabályzat
                </Link>
                <button
                  onClick={() => downloadPDF('cookies')}
                  disabled={downloading !== null}
                  className="text-xs text-indigo-400 hover:text-indigo-300 ml-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {downloading === 'cookies' ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      PDF
                    </>
                  ) : (
                    'PDF ↓'
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} SOS Beauty. Minden jog fenntartva.</p>
        </div>
      </div>
    </footer>
  );
} 