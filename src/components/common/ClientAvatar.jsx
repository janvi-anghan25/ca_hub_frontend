import { useState, useEffect } from 'react';

const sizeMap = {
  xs: { box: 'w-6 h-6 text-xs', text: 'text-xs' },
  sm: { box: 'w-8 h-8 text-sm', text: 'text-sm' },
  md: { box: 'w-10 h-10 text-base', text: 'text-base' },
  lg: { box: 'w-16 h-16 text-2xl', text: 'text-2xl' },
  xl: { box: 'w-20 h-20 text-3xl', text: 'text-3xl' },
};

const ClientAvatar = ({
  name = '',
  photo = null,
  size = 'sm',
  rounded = 'full',
  variant = 'light', // 'light' (bg-forest-100 text-forest) or 'dark' (bg-forest text-parchment)
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [photo]);

  const initial = name?.trim()?.[0]?.toUpperCase() || 'C';
  const sizeConfig = sizeMap[size] || sizeMap.sm;
  const roundedClass = rounded === 'full' ? 'rounded-full' : `rounded-${rounded}`;
  const bgClass =
    variant === 'dark'
      ? 'bg-forest text-parchment'
      : 'bg-forest-100 text-forest';

  if (photo && !hasError) {
    return (
      <div
        className={`${sizeConfig.box} ${roundedClass} overflow-hidden flex-shrink-0 border border-forest-100/50 bg-forest-50 ${className}`}
      >
        <img
          src={photo}
          alt={name || 'Client'}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeConfig.box} ${roundedClass} ${bgClass} flex items-center justify-center font-semibold flex-shrink-0 ${className}`}
    >
      {initial}
    </div>
  );
};

export default ClientAvatar;
