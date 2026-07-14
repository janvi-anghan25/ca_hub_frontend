import { FileSearch } from 'lucide-react';

const EmptyState = ({ icon: Icon = FileSearch, title = 'No results found', description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="p-4 rounded-2xl bg-forest-50 mb-4">
      <Icon size={32} className="text-forest-400" />
    </div>
    <h3 className="text-base font-semibold text-forest mb-1">{title}</h3>
    {description && <p className="text-sm text-forest-400 max-w-sm mb-4">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
