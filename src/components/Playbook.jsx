export default function Playbook() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Tier 1 */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h3 className="text-lg font-heading font-bold text-green-500 mb-4 flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          TIER 1 — Primary Search Terms
        </h3>
        <p className="text-xs text-gray-500 mb-3">Always start here</p>
        <ul className="space-y-2 text-gray-300 font-mono text-sm">
          <li>• Commercial epoxy flooring contractor</li>
          <li>• Resinous flooring contractor</li>
          <li>• Industrial floor coatings contractor</li>
          <li>• Concrete coatings contractor</li>
        </ul>
      </div>

      {/* Tier 2 */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h3 className="text-lg font-heading font-bold text-yellow-500 mb-4 flex items-center">
          <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
          TIER 2 — Strong Adjacent
        </h3>
        <ul className="space-y-2 text-gray-300 font-mono text-sm">
          <li>• Commercial flooring contractor</li>
          <li>• Industrial painting contractor</li>
          <li>• Facility maintenance contractor</li>
        </ul>
      </div>

      {/* Tier 3 */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h3 className="text-lg font-heading font-bold text-orange-500 mb-4 flex items-center">
          <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
          TIER 3 — Opportunistic
        </h3>
        <ul className="space-y-2 text-gray-300 font-mono text-sm">
          <li>• Concrete polishing contractor</li>
          <li>• Commercial property maintenance</li>
        </ul>
      </div>

      {/* Red Flags */}
      <div className="bg-dark-surface border border-red-900 rounded-lg p-6">
        <h3 className="text-lg font-heading font-bold text-red-500 mb-4 flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
          RED FLAGS — Skip Immediately
        </h3>
        <ul className="space-y-2 text-gray-300 font-mono text-sm">
          <li>• Road coating, traffic coating, pavement coating</li>
          <li>• Line striping, asphalt coating</li>
          <li>• Keywords: DOT, highway, roadway, striping</li>
        </ul>
      </div>

      {/* City Size Tip */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 md:col-span-2">
        <h3 className="text-lg font-heading font-bold text-blue-500 mb-4 flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
          CITY SIZE TIP
        </h3>
        <div className="text-gray-300 font-mono text-sm space-y-2">
          <p>• If results are mostly residential, jump to larger metros</p>
          <p>• Search one level out (e.g., instead of Evansville → try Louisville, Nashville, St. Louis)</p>
          <p>• Commercial/industrial contractors cluster in larger markets</p>
        </div>
      </div>

      {/* Go-To Stack */}
      <div className="bg-dark-surface border border-amber-900 rounded-lg p-6 md:col-span-2">
        <h3 className="text-lg font-heading font-bold text-amber-500 mb-4 flex items-center">
          <span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
          GO-TO STACK — Search in this order
        </h3>
        <ol className="space-y-2 text-gray-300 font-mono text-sm list-decimal list-inside">
          <li>Commercial epoxy flooring contractor + [city]</li>
          <li>Resinous flooring contractor + [city]</li>
          <li>Industrial floor coatings contractor + [city]</li>
          <li>Industrial painting contractor + [city]</li>
          <li>Concrete coatings contractor + [city]</li>
        </ol>
      </div>
    </div>
  )
}
