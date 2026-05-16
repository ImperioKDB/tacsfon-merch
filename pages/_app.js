/**
 * pages/_app.js
 *
 * Custom Next.js App component.
 * Runs the environment variable check once at server boot.
 */
import { checkEnv } from '../lib/startup/checkEnv.js'

// Run at module load time — fires once when the Next.js server starts
if (typeof window === 'undefined') {
  checkEnv()
}

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
