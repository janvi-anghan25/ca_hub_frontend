import CALogo, { CAEmblem } from '../common/CALogo';

const AuthLayout = ({ children }) => (
  <div className="min-h-screen flex">
    <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-forest via-forest-500 to-forest-700 flex-col justify-center p-12 text-parchment relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, #C4A57433, transparent 45%), radial-gradient(circle at 80% 80%, #1A4A4288, transparent 40%)',
        }}
      />
      <div className="relative max-w-md space-y-6">
        <div className="transition-transform hover:scale-105 inline-block">
          <CAEmblem size={64} idPrefix="auth-hero" />
        </div>
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-brass font-medium mb-3">Chartered Accountants Hub</p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-parchment">
            Your practice,<br />one ledger.
          </h1>
          <p className="mt-4 text-forest-300 text-sm leading-relaxed">
            Clients, GST, ITR, invoices, and tasks — calm tooling for filing season.
          </p>
        </div>
        <div className="h-0.5 w-16 bg-gradient-to-r from-brass to-brass/20 rounded-full" />
      </div>
    </div>

    <div className="flex-1 flex items-center justify-center p-5 sm:p-8 bg-forest-50 overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <CALogo variant="compact" size="sm" theme="dark" />
        </div>
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
