import { useState, useEffect } from 'react';
import Link from 'next/link';

type CookiePreferences = {
  szukseges: boolean;
  analitika: boolean;
  marketing: boolean;
};

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    szukseges: true, // Mindig engedélyezve
    analitika: false,
    marketing: false,
  });

  useEffect(() => {
    // Ellenőrizzük, hogy a felhasználó már döntött-e
    const savedPreferences = localStorage.getItem('sutiBeallitasok');
    if (!savedPreferences) {
      setShowBanner(true);
    } else {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const savePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('sutiBeallitasok', JSON.stringify(newPreferences));
    setShowBanner(false);
    setShowSettings(false);

    // Sütik beállítása
    if (newPreferences.analitika) {
      // Analitikai sütik engedélyezése
      enableAnalyticsCookies();
    } else {
      // Analitikai sütik letiltása
      disableAnalyticsCookies();
    }

    if (newPreferences.marketing) {
      // Marketing sütik engedélyezése
      enableMarketingCookies();
    } else {
      // Marketing sütik letiltása
      disableMarketingCookies();
    }
  };

  const acceptAll = () => {
    savePreferences({
      szukseges: true,
      analitika: true,
      marketing: true,
    });
  };

  const acceptNecessary = () => {
    savePreferences({
      szukseges: true,
      analitika: false,
      marketing: false,
    });
  };

  // Süti kezelő függvények
  const enableAnalyticsCookies = () => {
    // Itt inicializálhatod az analitikát (pl. Google Analytics)
    console.log('Analitikai sütik engedélyezve');
  };

  const disableAnalyticsCookies = () => {
    // Analitikai sütik eltávolítása és követés letiltása
    console.log('Analitikai sütik letiltva');
  };

  const enableMarketingCookies = () => {
    // Itt inicializálhatod a marketing sütiket
    console.log('Marketing sütik engedélyezve');
  };

  const disableMarketingCookies = () => {
    // Marketing sütik eltávolítása
    console.log('Marketing sütik letiltva');
  };

  if (!showBanner && !showSettings) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-gray-200">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {showSettings ? (
          // Süti beállítások ablak
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Süti beállítások</h2>
            <div className="space-y-4">
              {/* Szükséges sütik (mindig engedélyezve) */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Szükséges sütik</h3>
                  <p className="text-sm text-gray-600">
                    Ezek a sütik elengedhetetlenek a weboldal működéséhez, és nem kapcsolhatók ki a rendszerünkben.
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                </div>
              </div>

              {/* Analitikai sütik */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Analitikai sütik</h3>
                  <p className="text-sm text-gray-600">
                    Segítenek nekünk megérteni, hogyan használják a látogatók a weboldalunkat, hogy javíthassuk a szolgáltatásainkat.
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.analitika}
                    onChange={(e) => setPreferences({ ...preferences, analitika: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                </div>
              </div>

              {/* Marketing sütik */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Marketing sütik</h3>
                  <p className="text-sm text-gray-600">
                    Ezek a sütik segítenek a reklámok személyre szabásában és a marketing kampányok hatékonyságának mérésében.
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Mégse
              </button>
              <button
                onClick={() => savePreferences(preferences)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        ) : (
          // Süti értesítés sáv
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Ez a weboldal sütiket használ a felhasználói élmény javítása érdekében. A sütik használatával kapcsolatos részletes információkat a{' '}
                <Link href="/cookies" className="text-blue-600 hover:underline">
                  süti szabályzatban
                </Link>{' '}
                találja.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Testreszabás
              </button>
              <button
                onClick={acceptNecessary}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Csak szükséges
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Elfogadom mindet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 