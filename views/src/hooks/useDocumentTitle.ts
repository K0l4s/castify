import { useEffect } from 'react';

export function useDocumentTitle(title: string | null, fallback = 'Castify - Chill with your audience') {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title || fallback;
    
    return () => {
      document.title = previousTitle;
    };
  }, [title, fallback]);
}