const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };
  return (
    <div className={`animate-spin rounded-full border-forest border-t-transparent ${sizes[size]} ${className}`} />
  );
};

export const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-forest-50">
    <div className="flex flex-col items-center gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-forest-400 font-medium">Loading...</p>
    </div>
  </div>
);

export const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <LoadingSpinner size="md" />
  </div>
);

export default LoadingSpinner;
