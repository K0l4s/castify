import { FC, memo } from 'react';

interface PodcastCardProps {
  title: string;
  author: string;
  thumbnailUrl: string;
  duration: string;
  description: string;
  onClick?: () => void;
  className?: string; // Added for more flexibility
  viewCount?: number; // Added to show popularity
  isNew?: boolean; // Added to highlight new content
}

const PodcastCard: FC<PodcastCardProps> = memo(({
  title,
  author,
  thumbnailUrl,
  duration,
  description,
  onClick,
  className = '',
  viewCount,
  isNew = false
}) => {
  return (
    <div 
      className={`max-w-[200px] rounded-lg overflow-hidden shadow-lg bg-gray-800 hover:bg-gray-700/80 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
      aria-label={`Podcast: ${title} by ${author}`}
    >
      <div className="relative aspect-[9/13] group">
        {isNew && (
          <span className="absolute top-2 left-2 bg-indigo-500 text-white px-2 py-1 text-xs rounded-full font-medium z-10">
            New
          </span>
        )}
        <img 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          src={thumbnailUrl} 
          alt={`${title} podcast thumbnail`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <span className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 text-xs rounded-full font-medium">
          {duration}
        </span>
      </div>
      
      <div className="px-3 py-3">
        <h3 className="font-bold text-sm text-white mb-1.5 line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 text-xs mb-1 hover:text-gray-300 transition-colors font-medium">
          {author}
        </p>
        {viewCount !== undefined && (
          <p className="text-gray-500 text-xs mb-2">
            {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(viewCount)} views
          </p>
        )}
        <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed opacity-90">
          {description}
        </p>
      </div>
    </div>
  );
});

PodcastCard.displayName = 'PodcastCard';

export default PodcastCard;
