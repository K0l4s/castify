
// import ChatNotification from './components/modals/msg/ChatNotification';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LanguageProvider } from './context/LanguageContext'
import { PodcastProvider } from './context/PodcastContext'
// import { ThemeProvider } from './context/ThemeContext'
import Router from './routers/Router'
export const clientId = import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID;
function App() {
  
  return (
    <>
      {/* <ThemeProvider> */}
      <GoogleOAuthProvider clientId={clientId}>
      <LanguageProvider>
        <PodcastProvider>
          <Router />
          {/* <ChatNotification/> */}

        </PodcastProvider>
      </LanguageProvider>
      </GoogleOAuthProvider>
      {/* </ThemeProvider> */}
    </>
  )
}

export default App;
