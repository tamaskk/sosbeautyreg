import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="hu" dir="ltr">
      <Head>
        <meta name="language" content="hu" />
        <meta httpEquiv="Content-Language" content="hu" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 