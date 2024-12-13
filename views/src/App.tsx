

import { PodcastProvider } from './context/PodcastContext'
import { ThemeProvider } from './context/ThemeContext'
import Router from './routers/Router'

function App() {
   
    
    return (
      <>
        <ThemeProvider>
          <PodcastProvider>
            <Router />
          </PodcastProvider>
        </ThemeProvider>
      </>
    )
  }

  export default App;
