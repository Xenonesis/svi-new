import { MapPin, Clock } from 'lucide-react';
import { COMMUTE_MATRIX } from './phuleraData';

interface PhuleraCommuteTableProps {
  isHindi: boolean;
}

export function PhuleraCommuteTable({ isHindi }: PhuleraCommuteTableProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              {isHindi ? 'दूरी एवं कनेक्टिविटी तालिका' : 'Strategic Transit Matrix'}
            </span>
            <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-4xl">
              {isHindi
                ? 'फुलेरा जंक्शन से प्रमुख केंद्रों की दूरी'
                : 'Distance & Commute Time from Phulera'}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xs text-slate-300 sm:text-sm">
              {isHindi
                ? 'फुलेरा जंक्शन एवं DMIC कॉरिडोर से जयपुर, अजमेर, रीको एवं तीर्थ स्थलों की वास्तविक दूरी एवं समय।'
                : 'Verified road and rail commute times connecting Phulera Smart City to key industrial hubs, expressways, and central Jaipur.'}
            </p>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-white/10 bg-white/[0.04] text-[11px] font-bold tracking-wider text-amber-300 uppercase sm:text-xs">
                  <tr>
                    <th className="px-4 py-4 sm:px-6">
                      {isHindi ? 'गंतव्य / लैंडमार्क' : 'Destination / Landmark'}
                    </th>
                    <th className="px-4 py-4 sm:px-6">{isHindi ? 'दूरी' : 'Distance'}</th>
                    <th className="px-4 py-4 sm:px-6">{isHindi ? 'समय' : 'Drive Time'}</th>
                    <th className="hidden px-4 py-4 sm:px-6 md:table-cell">
                      {isHindi ? 'रूट / विशेषता' : 'Route / Infrastructure'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {COMMUTE_MATRIX.map((item, index) => (
                    <tr key={index} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-4 font-medium text-white sm:px-6">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="shrink-0 text-amber-400" />
                          <span>{isHindi ? item.landmarkHi : item.landmark}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-amber-300 sm:px-6">
                        {item.distance}
                      </td>
                      <td className="px-4 py-4 text-slate-300 sm:px-6">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs">
                          <Clock size={12} className="text-amber-400" />
                          <span>{item.time}</span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-4 text-xs text-slate-400 sm:px-6 md:table-cell">
                        <div>{isHindi ? item.routeHi : item.route}</div>
                        <div className="text-[11px] text-slate-500">
                          {isHindi ? item.highlightHi : item.highlight}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
