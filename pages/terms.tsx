export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Általános Szerződési Feltételek</h1>
      
      <div className="prose prose-indigo max-w-none">
        <h2>1. Általános információk</h2>
        <p>
          A SOS Beauty (továbbiakban: "Szolgáltató") általános szerződési feltételei (továbbiakban: "ÁSZF") 
          a www.sosbeauty.hu weboldalon (továbbiakban: "Weboldal") keresztül nyújtott szolgáltatások igénybevételére vonatkoznak.
        </p>

        <h2>2. A Szolgáltató adatai</h2>
        <p>
          Név: SOS Beauty<br />
          Székhely: 1161 Budapest Baross utca 101<br />
          Adószám: 91029559-1-42<br />
          Email: sosbeauty@outlook.hu
        </p>

        <h2>3. A szolgáltatás leírása</h2>
        <p>
          A Weboldal egy online platform, amely lehetővé teszi a szépségipari szolgáltatók számára, 
          hogy profiljukat létrehozzák és kezeljék, valamint a felhasználók számára, 
          hogy megtalálják és felkeressék ezeket a szolgáltatókat.
        </p>

        <h2>4. Regisztráció és hozzáférés</h2>
        <p>
          A szolgáltatás igénybevételéhez regisztráció szükséges. A regisztráció során megadott adatoknak 
          valósnak és pontosnak kell lenniük. A szolgáltatást minden szépségipari szolgáltató igénybe veheti.
        </p>

        <h2>5. Felhasználói kötelezettségek</h2>
        <p>A felhasználók kötelesek:</p>
        <ul>
          <li>Valós és pontos adatokat megadni</li>
          <li>Az adatvédelmi nyilatkozatot elfogadni</li>
          <li>A szolgáltatást nem jogosulatlanul használni</li>
          <li>Nem feltöltött tartalmakkal nem visszaélni</li>
          <li>A szolgáltatás biztonságát nem veszélyeztetni</li>
        </ul>

        <h2>6. Tartalom feltöltése</h2>
        <p>
          A feltöltött képeknek és videóknak megfelelőnek kell lenniük, nem tartalmazhatnak 
          kifogásolható vagy jogvédett tartalmakat. A Szolgáltató fenntartja a jogot, 
          hogy a nem megfelelő tartalmakat eltávolítsa.
        </p>

        <h2>7. Szolgáltatói profilok</h2>
        <p>
          A szolgáltatói profilok létrehozásához és kezeléséhez külön hozzáférési kód szükséges. 
          A profilokban megadott információk valósaknak és pontosaknak kell lenniük. 
          A Szolgáltató fenntartja a jogot, hogy a nem megfelelő profilokat eltávolítsa.
        </p>

        <h2>8. Adatvédelmi jogok</h2>
        <p>
          A felhasználók adatait a Szolgáltató az adatvédelmi nyilatkozatban foglaltak szerint kezeli. 
          A felhasználók bármikor kérhetik adataik törlését vagy módosítását.
        </p>

        <h2>9. Felelősség</h2>
        <p>
          A Szolgáltató nem vállal felelősséget a szolgáltatók által nyújtott szolgáltatások minőségéért. 
          A felhasználók saját felelősségükre használják a platformot és keressék fel a szolgáltatókat.
        </p>

        <h2>10. Szerzői jogok</h2>
        <p>
          A Weboldal tartalma a Szolgáltató tulajdonát képezi. A feltöltött tartalmak 
          feltöltőjének tulajdonát képezik, aki a Szolgáltatónak nem kizárólagos jogot ad 
          a tartalmak használatára.
        </p>

        <h2>11. Változások</h2>
        <p>
          A Szolgáltató fenntartja a jogot, hogy ezeket a feltételeket bármikor módosítsa. 
          A változásokról értesítjük a felhasználókat a Weboldalon keresztül.
        </p>

        <h2>12. Jogviták rendezése</h2>
        <p>
          A jelen ÁSZF-re a magyar jog az irányadó. A jogviták rendezésére a magyar bíróságok 
          rendelkeznek joghatósággal.
        </p>

        <p className="mt-8 text-sm text-gray-500">
          Utolsó frissítés: {new Date().toLocaleDateString('hu-HU')}
        </p>
      </div>
    </div>
  );
} 