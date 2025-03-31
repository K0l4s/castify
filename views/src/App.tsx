
// import ChatNotification from './components/modals/msg/ChatNotification';
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
          {/* <ChatNotification/> */}

        </PodcastProvider>
      </LanguageProvider>
      {/* </ThemeProvider> */}
    </>
  )
}

export default App;
