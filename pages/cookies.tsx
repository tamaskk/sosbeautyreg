export default function CookiePolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Szabályzat</h1>
      
      <div className="prose prose-indigo max-w-none">
        <h2>1. Bevezetés</h2>
        <p>
          A SOS Beauty (továbbiakban: "mi", "minket", "miénk") weboldalán cookie-kat használunk 
          a felhasználói élmény javítása érdekében. Ez a szabályzat tájékoztatást nyújt a cookie-k 
          használatáról és az Ön választási lehetőségeiről.
        </p>

        <h2>2. Mi a cookie?</h2>
        <p>
          A cookie-k kis méretű szöveges fájlok, amelyeket a weboldal az Ön eszközén tárol. 
          Ezek segítenek a weboldal működésében és információt szolgáltatnak a weboldal tulajdonosának.
        </p>

        <h2>3. Cookie-k típusai</h2>
        <p>A weboldalunk a következő típusú cookie-kat használja:</p>

        <h3>3.1. Feltétlenül szükséges cookie-k</h3>
        <p>
          Ezek a cookie-k nélkülözhetetlenek a weboldal működéséhez. Lehetővé teszik az alapvető 
          funkciók használatát, mint például a bejelentkezés és a biztonság. Ezek a cookie-k nem 
          kapcsolódnak az Ön személyes adataihoz.
        </p>

        <h3>3.2. Teljesítmény cookie-k</h3>
        <p>
          Ezek a cookie-k segítenek megérteni, hogyan használják a látogatók a weboldalt. 
          Segítenek a weboldal teljesítményének mérésében és javításában.
        </p>

        <h3>3.3. Funkcionális cookie-k</h3>
        <p>
          Ezek a cookie-k lehetővé teszik a weboldal számára, hogy emlékezzen az Ön választásaira 
          (például felhasználónév, nyelv, régió), és továbbfejlesztett, személyre szabott funkciókat nyújtson.
        </p>

        <h3>3.4. Célzó cookie-k</h3>
        <p>
          Ezek a cookie-k a reklámpartnereink által a weboldalunkon keresztül helyezhetők el. 
          Ezek a vállalatok használhatják ezeket a cookie-kat az Ön érdeklődési körének felépítéséhez 
          és más weboldalakon releváns reklámok megjelenítéséhez.
        </p>

        <h2>4. Cookie-k kezelése</h2>
        <p>
          A legtöbb böngésző automatikusan elfogadja a cookie-kat, de Ön módosíthatja a böngésző 
          beállításait, hogy letiltsa a cookie-kat. Kérjük, vegye figyelembe, hogy a cookie-k 
          letiltása hatással lehet a weboldal használhatóságára.
        </p>

        <h2>5. Harmadik felek cookie-i</h2>
        <p>
          A weboldalunkon harmadik felek (például Google Analytics, Facebook) cookie-it is használunk. 
          Ezek a cookie-k a harmadik felek által kezeltek, és a saját adatvédelmi irányelveik szerint 
          működnek.
        </p>

        <h2>6. Cookie-k élettartama</h2>
        <p>A weboldalunkon használt cookie-k élettartama:</p>
        <ul>
          <li>Munkamenet cookie-k: A böngésző bezárásakor törlődnek</li>
          <li>Állandó cookie-k: Több hónapig vagy évig is érvényesek lehetnek</li>
        </ul>

        <h2>7. Cookie-k kezelése böngészőben</h2>
        <p>
          A cookie-k kezelését a böngésző beállításaiban tudja módosítani. A legtöbb böngészőben 
          a következő lehetőségek közül választhat:
        </p>
        <ul>
          <li>Cookie-k elfogadása</li>
          <li>Cookie-k elutasítása</li>
          <li>Értesítés kérése cookie-k használatakor</li>
        </ul>

        <h2>8. Változások</h2>
        <p>
          Fenntartjuk a jogot, hogy ezt a cookie szabályzatot bármikor módosítsuk. 
          A változásokról értesítjük Önt a weboldalon keresztül.
        </p>

        <h2>9. Kapcsolat</h2>
        <p>
          Ha kérdése van a cookie-k használatával kapcsolatban, kérjük, vegye fel velünk a kapcsolatot 
          az sosbeauty@outlook.hu email címen.
        </p>

        <p className="mt-8 text-sm text-gray-500">
          Utolsó frissítés: {new Date().toLocaleDateString('hu-HU')}
        </p>
      </div>
    </div>
  );
} 