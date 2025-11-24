import type { AppProps } from 'next/app';
import '../css/global.css';

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
