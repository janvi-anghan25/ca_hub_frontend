import { Building2 } from 'lucide-react';

const FEATURES = [
  'Client Management',
  'GST Returns',
  'ITR Filing',
  'Invoice Generation',
  'WhatsApp Reminders',
  'Payment Tracking',
];

const AuthLayout = ({ children }) => (
  <div className="min-h-screen flex">
    {/* Left decorative panel */}
    <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col items-center justify-center p-12 text-white relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-sm text-center space-y-7">
        {/* Logo */}
        <div className="w-20 h-20 bg-white/15 border border-white/20 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-sm shadow-lg">
          <Building2 size={40} className="text-white" />
        </div>

        {/* Headline */}
        <div>
          <h1 className="text-3xl font-bold mb-3 tracking-tight">CA Office Management</h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Manage your entire CA office workflow — clients, GST returns, ITR filings, invoices, and more — from a single platform.
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 gap-2.5 text-left">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-3 py-2">
              <div className="w-1.5 h-1.5 bg-blue-300 rounded-full flex-shrink-0" />
              <span className="text-xs text-blue-50 font-medium">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Right content panel */}
    <div className="flex-1 flex items-center justify-center p-5 sm:p-8 bg-gray-50 overflow-y-auto">
      <div className="w-full max-w-md">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">CA Management</span>
        </div>
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
