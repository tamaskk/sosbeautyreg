export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Adatvédelmi Nyilatkozat</h1>
      
      <div className="prose prose-indigo max-w-none">
        <h2>1. Bevezetés</h2>
        <p>
          A SOS Beauty (továbbiakban: "mi", "minket", "miénk") elkötelezett az Ön adatainak védelme mellett. 
          Ez az adatvédelmi nyilatkozat tájékoztatást nyújt arról, hogyan gyűjtjük, használjuk, tároljuk és védjük az Ön személyes adatait.
        </p>

        <h2>2. Adatkezelő</h2>
        <p>
          Név: SOS Beauty<br />
          Székhely: 1161 Budapest Baross utca 101<br />
          Email: sosbeauty@outlook.hu
        </p>

        <h2>3. Gyűjtött adatok</h2>
        <p>A következő személyes adatokat gyűjtjük:</p>
        <ul>
          <li>Név</li>
          <li>Email cím</li>
          <li>Telefonszám</li>
          <li>Cím adatok (ország, város, irányítószám, utca, házszám)</li>
          <li>Szolgáltatási kategória</li>
          <li>Ár információ</li>
          <li>Feltöltött képek és videók</li>
          <li>Közösségi média profilok</li>
        </ul>

        <h2>4. Adatkezelés célja</h2>
        <p>Az Ön adatait a következő célokra használjuk:</p>
        <ul>
          <li>Szolgáltatói profil létrehozása és kezelése</li>
          <li>Kapcsolattartás Önnel</li>
          <li>Szolgáltatások nyújtása és fejlesztése</li>
          <li>Jogi kötelezettségek teljesítése</li>
          <li>Marketing és kommunikációs célok (csak az Ön hozzájárulásával)</li>
        </ul>

        <h2>5. Adatkezelés jogalapja</h2>
        <p>Az adatkezelés jogalapja a következő lehet:</p>
        <ul>
          <li>Az Ön hozzájárulása</li>
          <li>Szerződés teljesítése</li>
          <li>Jogi kötelezettség teljesítése</li>
          <li>Jogos érdek</li>
        </ul>

        <h2>6. Adatok megőrzése</h2>
        <p>
          Az Ön adatait csak addig tároljuk, amíg az adatkezelés célja megköveteli, vagy amíg Ön nem kéri azok törlését. 
          A szolgáltatói profilok adatait a szolgáltatás megszűnéséig, vagy az Ön kéréséig tároljuk.
        </p>

        <h2>7. Adatvédelmi jogok</h2>
        <p>Önnek joga van:</p>
        <ul>
          <li>Hozzáférést kérni az Ön adataihoz</li>
          <li>Az Ön adatainak helyesbítését kérni</li>
          <li>Az Ön adatainak törlését kérni</li>
          <li>Az adatkezelés korlátozását kérni</li>
          <li>Az adathordozhatósághoz való jogot gyakorolni</li>
          <li>Tiltakozni az adatkezelés ellen</li>
          <li>Visszavonni a hozzájárulását</li>
        </ul>

        <h2>8. Adatbiztonság</h2>
        <p>
          Megfelelő technikai és szervezési intézkedéseket alkalmazunk az Ön adatainak védelme érdekében. 
          Ezek közé tartozik a titkosítás, a hozzáférési jogosultságok kezelése, és a rendszeres biztonsági felülvizsgálatok.
        </p>

        <h2>9. Cookie-k használata</h2>
        <p>
          Weboldalunk cookie-kat használ a felhasználói élmény javítása érdekében. 
          A cookie-k használatáról részletes információt talál a Cookie Szabályzatban.
        </p>

        <h2>10. Harmadik felek</h2>
        <p>
          Az Ön adatait csak a szolgáltatás nyújtásához szükséges harmadik felekkel osztjuk meg, 
          mint például a tárhelyszolgáltatók és a fizetési feldolgozók.
        </p>

        <h2>11. Kapcsolat</h2>
        <p>
          Adatvédelmi kérdéseivel kapcsolatban kérjük, vegye fel velünk a kapcsolatot az sosbeauty@outlook.hu email címen.
        </p>

        <h2>12. Változások</h2>
        <p>
          Fenntartjuk a jogot, hogy ezt az adatvédelmi nyilatkozatot bármikor módosítsuk. 
          A változásokról értesítjük Önt a weboldalon keresztül.
        </p>

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Letölthető dokumentumok</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/assets/Adatvédelmi nyilatkozat.pdf"
              download
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Adatvédelmi Nyilatkozat
            </a>
            <a
              href="/assets/suti.pdf"
              download
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cookie Szabályzat
            </a>
            <a
              href="/assets/általánosszf.pdf"
              download
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Általános Szerződési Feltételek
            </a>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Utolsó frissítés: {new Date().toLocaleDateString('hu-HU')}
        </p>
      </div>
    </div>
  );
} 