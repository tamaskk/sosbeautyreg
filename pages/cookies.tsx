import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';

export default function Cookies() {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>Süti Szabályzat | SOS Beauty</title>
        <meta name="description" content="SOS Beauty süti szabályzata és adatkezelési tájékoztató" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <h1>Süti Szabályzat és Adatkezelési Tájékoztató</h1>

          <h2>1. Adatbázis Szolgáltató</h2>
          <p>
            Weboldalunk adatbázis szolgáltatója a MongoDB Atlas (továbbiakban: MongoDB), amely a MongoDB Inc. által üzemeltetett felhőalapú adatbázis szolgáltatás.
          </p>
          <p>
            <strong>MongoDB Inc. adatai:</strong>
          </p>
          <ul>
            <li>Székhely: 1633 Broadway, 38th Floor, New York, NY 10019, USA</li>
            <li>Adatvédelmi irányelvek: <a href="https://www.mongodb.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">https://www.mongodb.com/legal/privacy-policy</a></li>
            <li>Adatvédelmi tisztviselő: <a href="mailto:privacy@mongodb.com">privacy@mongodb.com</a></li>
          </ul>

          <h3>MongoDB Adatkezelési Részletek:</h3>
          <ul>
            <li>
              <strong>Adatkezelés helye:</strong> Az adatok az Európai Unión belül, MongoDB európai adatközpontjaiban tárolódnak (AWS európai régiók)
            </li>
            <li>
              <strong>Adatkezelés jogalapja:</strong> Az adatkezelés a szolgáltatás nyújtása érdekében történik, a MongoDB felhőalapú adatbázis szolgáltatás keretében
            </li>
            <li>
              <strong>Adatmegőrzés:</strong> Az adatok a szolgáltatás használatának időtartamára, valamint a jogszabályi megőrzési kötelezettségeknek megfelelően tárolódnak
            </li>
            <li>
              <strong>Adatbiztonság:</strong> MongoDB Atlas megfelel az ISO 27001, SOC 2 Type II, és PCI DSS szabványoknak, biztosítva az adatok biztonságát
            </li>
          </ul>

          <h2>2. Süti (Cookie) Használat</h2>
          <p>
            Weboldalunk sütiket (cookie-kat) használ a felhasználói élmény javítása és a szolgáltatások biztosítása érdekében. A sütik kis szöveges fájlok, amelyek a felhasználó eszközén tárolódnak.
          </p>

          <h3>2.1. Süti Kategóriák</h3>
          <ul>
            <li>
              <strong>Szükséges sütik:</strong> Ezek a sütik elengedhetetlenek a weboldal működéséhez. Lehetővé teszik az alapvető funkciók használatát, például a bejelentkezést és a biztonságos területek elérését.
            </li>
            <li>
              <strong>Analitikai sütik:</strong> Segítenek nekünk megérteni, hogyan használják a látogatók a weboldalunkat. Az ezekből származó információk segítenek a weboldal fejlesztésében és optimalizálásában.
            </li>
            <li>
              <strong>Marketing sütik:</strong> Ezek a sütik a reklámok személyre szabására és a marketing kampányok hatékonyságának mérésére szolgálnak.
            </li>
          </ul>

          <h3>2.2. Harmadik Fél Sütik</h3>
          <p>
            A MongoDB Atlas szolgáltatás használata során a MongoDB saját sütiket használhat a szolgáltatás működéséhez és biztonságához. Ezek a sütik a MongoDB adatvédelmi irányelveinek megfelelően kerülnek kezelésre.
          </p>

          <h2>3. Adatvédelmi Jogok</h2>
          <p>
            Felhasználóink a következő jogokkal rendelkeznek:
          </p>
          <ul>
            <li>Hozzáférési jog</li>
            <li>Helyesbítéshez való jog</li>
            <li>Törléshez való jog</li>
            <li>Az adatkezelés korlátozásához való jog</li>
            <li>Adathordozhatósághoz való jog</li>
            <li>Tiltakozáshoz való jog</li>
            <li>Az adatkezeléshez való hozzájárulás visszavonásához való jog</li>
          </ul>

          <h2>4. Kapcsolat</h2>
          <p>
            Ha kérdése van a süti használattal vagy az adatkezeléssel kapcsolatban, kérjük, vegye fel velünk a kapcsolatot:
          </p>
          <ul>
            <li>Email: sosbeauty@outlook.hu</li>
          </ul>

          <p className="text-sm text-gray-600 mt-8">
            Utolsó frissítés: {new Date().toLocaleDateString('hu-HU')}
          </p>
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'hu', ['common'])),
    },
  };
}; 