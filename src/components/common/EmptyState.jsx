import { FileSearch } from 'lucide-react';

const EmptyState = ({ icon: Icon = FileSearch, title = 'No results found', description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="p-4 rounded-2xl bg-gray-100 mb-4">
      <Icon size={32} className="text-gray-400" />
    </div>
    <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
