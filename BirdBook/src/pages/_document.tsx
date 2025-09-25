import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link 
          href="https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.min.css" 
          rel="stylesheet" 
          type="text/css" 
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
