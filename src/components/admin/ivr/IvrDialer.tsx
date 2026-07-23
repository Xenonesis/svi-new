import React, { useState } from 'react';
import { PhoneCall, AlertCircle, Volume2 } from 'lucide-react';

interface IvrDialerProps {
  token: string | null;
}

export function IvrDialer({ token }: IvrDialerProps) {
  const [dialerFrom, setDialerFrom] = useState('');
  const [dialerTo, setDialerTo] = useState('');
  const [dialing, setDialing] = useState(false);
  const [dialResult, setDialResult] = useState<{ success: boolean; msg: string } | null>(null);

  const handleDial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !dialerFrom || !dialerTo) return;

    setDialing(true);
    setDialResult(null);

    try {
      const res = await fetch('/api/admin/ivr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from_number: dialerFrom,
          to_number: dialerTo,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status?.code === 200) {
        setDialResult({
          success: true,
          msg: 'Live Call triggered successfully! Telephony gateway is bridging the connections.',
        });
        setDialerTo('');
      } else {
        throw new Error(data.status?.message || 'Failed to place call');
      }
    } catch (err: any) {
      setDialResult({
        success: false,
        msg: err.message || 'Call failed to initiate. Please check connection.',
      });
    } finally {
      setDialing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Dial out form */}
      <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
        <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/5">
          <div className="bg-brand-gold/10 border-brand-gold/20 flex h-9 w-9 items-center justify-center rounded-lg border">
            <PhoneCall className="text-brand-gold h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Initiate Outgoing Call Bridge
            </h2>
            <p className="text-[10px] tracking-wider text-gray-500 uppercase">
              Dial client from executive numbers
            </p>
          </div>
        </div>

        <form onSubmit={handleDial} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              Executive Number (from_number)
            </label>
            <input
              type="text"
              required
              value={dialerFrom}
              onChange={(e) => setDialerFrom(e.target.value)}
              placeholder="e.g. 9999988888"
              className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-all dark:border-white/10 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              Customer Number (to_number)
            </label>
            <input
              type="text"
              required
              value={dialerTo}
              onChange={(e) => setDialerTo(e.target.value)}
              placeholder="e.g. 9885123456"
              className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-all dark:border-white/10 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={dialing}
            className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-4 text-xs font-bold tracking-widest uppercase shadow-xl transition-all disabled:opacity-60"
          >
            {dialing ? (
              <>
                <div className="border-brand-navy/30 border-t-brand-navy h-4 w-4 animate-spin rounded-full border-2" />
                Initiating Bridge...
              </>
            ) : (
              <>
                <PhoneCall className="h-4 w-4" /> Dial Out
              </>
            )}
          </button>
        </form>

        {dialResult && (
          <div
            className={`mt-5 flex gap-2.5 rounded-lg border p-4 text-xs ${
              dialResult.success
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-950/20 dark:text-emerald-400'
                : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/25 dark:bg-red-950/20 dark:text-red-400'
            }`}
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                {dialResult.success ? 'Call Bridge Started' : 'Call Failed'}
              </p>
              <p className="mt-0.5">{dialResult.msg}</p>
            </div>
          </div>
        )}
      </div>

      {/* Dialer Guidelines */}
      <div className="dark:bg-brand-dark-surface/65 relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
        <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        <div>
          <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
            Call Bridging Guidelines
          </h3>
          <ul className="space-y-3.5 text-xs text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2.5">
              <span className="bg-brand-gold/10 text-brand-gold mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                1
              </span>
              <span>
                The Call Bridge connects the **Executive (From)** and the **Customer (To)** via the
                cloud telephony gateway.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="bg-brand-gold/10 text-brand-gold mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                2
              </span>
              <span>
                The telephony server first dials the **Executive Number**. Once the executive
                answers, the system initiates the call to the **Customer**.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="bg-brand-gold/10 text-brand-gold mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                3
              </span>
              <span>
                Recording is automatically enabled on all call bridges and will appear in the
                History logs as soon as the call finishes.
              </span>
            </li>
          </ul>
        </div>

        <div className="border-brand-gold/20 bg-brand-gold/5 mt-8 flex items-center gap-3.5 rounded-lg border p-4 text-xs">
          <Volume2 className="text-brand-gold h-5 w-5 flex-shrink-0" />
          <span className="text-brand-navy-light dark:text-gray-300">
            Make sure the executive phone is active and ready to receive the incoming bridge dial.
          </span>
        </div>
      </div>
    </div>
  );
}
