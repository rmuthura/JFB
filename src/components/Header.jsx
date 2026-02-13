export default function Header() {
  return (
    <header className="bg-dark-surface border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white tracking-wide">
              JFB HART COATINGS
            </h1>
            <p className="text-amber-500 font-heading text-sm tracking-widest uppercase">
              Lead Command Center
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 font-mono">Supreme Xtreme</span>
          </div>
        </div>
      </div>
    </header>
  )
}
