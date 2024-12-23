

import { LanguageProvider } from './context/LanguageContext'
import { PodcastProvider } from './context/PodcastContext'
// import { ThemeProvider } from './context/ThemeContext'
import Router from './routers/Router'

function App() {


  return (
    <>
      {/* <ThemeProvider> */}
      <LanguageProvider>
        <PodcastProvider>
          <Router />
        </PodcastProvider>
      </LanguageProvider>
      {/* </ThemeProvider> */}
    </>
  )
}

export default App;
