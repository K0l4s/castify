export const formatViewsToShortly = (views: number): string => {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return views.toString();
};

export const formatViewsWithSeparators = (views: number): string => {
  return new Intl.NumberFormat('en-US').format(views);
};