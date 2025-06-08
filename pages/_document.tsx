import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="hu">
      <Head>
        {/* Usercentrics CMP Scripts */}
        <script src="https://web.cmp.usercentrics.eu/modules/autoblocker.js" />
        <script 
          id="usercentrics-cmp" 
          src="https://web.cmp.usercentrics.eu/ui/loader.js" 
          data-settings-id="1N7b4k-eP0ld8-" 
          async 
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 