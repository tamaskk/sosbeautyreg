import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

const CATEGORY_KEYS = [
  'eyelash',
  'nails',
  'female_hair',
  'makeup',
  'lip_filler',
  'male_hair',
  'laser_hair',
  'cosmetologist',
  'botox',
  'permanent_makeup',
  'waxing',
  'brow_lash',
  'hair_extension',
  'pedicure',
  'fitness'
] as const;

const CATEGORY_LABELS = {
  eyelash: 'Pillás',
  nails: 'Körmös',
  female_hair: 'Női fodrász',
  makeup: 'Sminkes',
  lip_filler: 'Szájfeltöltés',
  male_hair: 'Férfi fodrász',
  laser_hair: 'Lézeres szőrtelenítés',
  cosmetologist: 'Kozmetikus',
  botox: 'Botox',
  permanent_makeup: 'Sminktetoválás',
  waxing: 'Gyanta',
  brow_lash: 'Szemöldök és szempilla',
  hair_extension: 'Hajhosszabbítás',
  pedicure: 'Pedikűr',
  fitness: 'Fitness/mozgás'
} as const;

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      toast.error('Kérjük, válassz legalább egy kategóriát');
      return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const response = await fetch('/api/codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          usageLimit: selectedCategories.length,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate code');
      }

      const data = await response.json();
      setAccessCode(data.code);
      toast.success(`A ${data.code} hozzáférési kód sikeresen generálva! Használati limit: ${data.usageLimit}`);
    } catch (error) {
      toast.error('Hiba történt a kód generálása során. Kérjük, próbáld újra.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (accessCode) {
      await navigator.clipboard.writeText(accessCode);
      toast.success('A hozzáférési kód vágólapra másolva!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kérj Hozzáférési Kódot</h1>
        <p className="text-gray-600">Szerezd meg a hozzáférési kódodat a szépségipari szolgáltatásod feltöltéséhez</p>
      </div>

      {!accessCode ? (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white shadow rounded-lg p-8">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Cím
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              placeholder="példa@email.com"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Válaszd Ki a Kategóriáidat
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Válassz ki annyi kategóriát, ahányszor szeretnéd használni a kódot. Minden kiválasztott kategória egy külön alkalommal használható. Például: ha 3 kategóriát választasz, akkor a kódot 3 különböző szolgáltatás feltöltésére tudod majd használni.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORY_KEYS.map(categoryKey => (
                <button
                  key={categoryKey}
                  type="button"
                  onClick={() => handleCategoryClick(categoryKey)}
                  className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                    selectedCategories.includes(categoryKey)
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {CATEGORY_LABELS[categoryKey]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Kód Generálása...' : 'Kérj Kódot'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-4">A Hozzáférési Kódod</h2>
          <div className="flex items-center justify-center space-x-4">
            <code className="text-2xl font-mono bg-gray-100 px-4 py-2 rounded">
              {accessCode}
            </code>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Másolás
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 