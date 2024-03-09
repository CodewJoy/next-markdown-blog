import "../styles/globals.css";
import "highlight.js/styles/night-owl.css";

function MyApp({ Component, pageProps }) {
  console.log(pageProps);
  return <Component {...pageProps} />;
}

export default MyApp;
