import { checkEnv } from '../lib/startup/checkEnv.js'

if (typeof window === 'undefined') {
  checkEnv()
}

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
