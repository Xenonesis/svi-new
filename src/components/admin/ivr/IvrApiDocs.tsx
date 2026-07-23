import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function IvrApiDocs() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const docs = [
    {
      title: 'Fetch Call History',
      endpoint: 'GET / POST  http://49.50.106.182/api/calls?token={token}',
      desc: 'Fetch lists of incoming calls, virtual numbers, and call logs with recording links.',
      params: [
        { name: 'offset', type: 'int', desc: 'Offset of Call History data' },
        { name: 'limit', type: 'int', desc: 'Limit of Call History data' },
        { name: 'virtual_number', type: 'int', desc: 'Virtual Number.' },
        { name: 'to_number', type: 'int', desc: 'User/Executive (Receiver) Number.' },
        { name: 'key', type: 'int', desc: 'DTMF Option' },
        { name: 'from_number', type: 'int', desc: 'Caller Number' },
        { name: 'duration', type: 'int', desc: 'Total Duration in second' },
        { name: 'aduration', type: 'int', desc: 'Answer duration in second' },
        {
          name: 'start_date',
          type: 'UNIX DATE TIME Y-m-d H:i:s',
          desc: 'Start Date of Call History. Example : 2017-12-04 00:00:00',
        },
        {
          name: 'end_date',
          type: 'UNIX DATE TIME Y-m-d H:i:s',
          desc: 'End Date of Call History. Example: 2017-12-04 23:59:59',
        },
        {
          name: 'status',
          type: 'string (ANSWERED or MISSED)',
          desc: 'Call Status Value',
        },
      ],
      response: `{
    "status": {
        "code": 200,
        "message": "OK"
    },
    "data": [
        {
            "uid": "1512331083.83",
            "virtual_number_id": "123",
            "virtual_number": "9999XXXXXX",
            "nick_name": "myself",
            "from_number": "9999XXXXXX",
            "key": "1",
            "to_number": "9999XXXXXX",
            "user": "User Name",
            "start": "2017-12-04 01:28:03",
            "answer": "2017-12-04 01:28:08",
            "end": "2017-12-04 01:28:11",
            "duration": "8",
            "billsec": "3",
            "pulse": "1",
            "status": "1",
            "play": "http://49.50.106.182/recordings/answered/XXXXXXXX_2017-12-04 01:28:08.wav"
        }
    ],
    "page": {
        "offset": 0,
        "limit": "1"
    },
    "statics": {
        "total": 19,
        "answered": 12,
        "missed": 7
    }
}`,
    },
    {
      title: 'Create Outgoing Call',
      endpoint: 'POST  http://49.50.106.182/api/createCall?token={token}',
      desc: 'Triggers a Call Bridge between the Executive and the Destination user.',
      params: [
        { name: 'from_number', type: 'int', desc: 'User/Executive (Receiver) Number.' },
        { name: 'to_number', type: 'int', desc: 'Destination Customer Number.' },
      ],
      response: `{
    "status": {
        "code": 200,
        "message": "OK"
    }
}`,
    },
    {
      title: 'Fetch Outgoing Call History',
      endpoint: 'GET / POST  http://49.50.106.182/api/outcalls?token={token}',
      desc: 'Fetch outgoing logs placed by executives.',
      params: [
        { name: 'offset', type: 'int', desc: 'Offset of Call History data' },
        { name: 'limit', type: 'int', desc: 'Limit of Call History data' },
        { name: 'virtual_number', type: 'int', desc: 'Virtual Number.' },
        { name: 'to_number', type: 'int', desc: 'User/Executive (Receiver) Number.' },
        { name: 'from_number', type: 'int', desc: 'Caller Number' },
        { name: 'duration', type: 'int', desc: 'Total Duration in second' },
        { name: 'aduration', type: 'int', desc: 'Answer duration in second' },
        {
          name: 'start_date',
          type: 'UNIX DATE TIME Y-m-d H:i:s',
          desc: 'Start Date of Call History. Example : 2017-12-04 00:00:00',
        },
        {
          name: 'end_date',
          type: 'UNIX DATE TIME Y-m-d H:i:s',
          desc: 'End Date of Call History. Example: 2017-12-04 23:59:59',
        },
        {
          name: 'status',
          type: 'string (ANSWERED or MISSED)',
          desc: 'Call Status Value',
        },
      ],
      response: `{
    "status": {
        "code": 200,
        "message": "OK"
    },
    "data": [
        {
            "uid": "1512331083.83",
            "virtual_number": "9999XXXXXX",
            "nick_name": "myself",
            "from_number": "9999XXXXXX",
            "to_number": "9999XXXXXX",
            "user": "User Name",
            "start": "2017-12-04 01:28:03",
            "answer": "2017-12-04 01:28:08",
            "end": "2017-12-04 01:28:11",
            "duration": "8",
            "billsec": "3",
            "pulse": "1",
            "status": "1",
            "play": "http://49.50.106.182/recordings/answered/XXXXXXXX_2017-12-04 01:28:08.wav"
        }
    ],
    "page": {
        "offset": 0,
        "limit": "1"
    },
    "statics": {
        "total": 19,
        "answered": 12,
        "missed": 7
    }
}`,
    },
  ];

  return (
    <div className="space-y-6">
      {docs.map((doc, idx) => (
        <div
          key={idx}
          className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8"
        >
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <h3 className="text-base font-bold text-gray-900 dark:text-white">{doc.title}</h3>
          <p className="mt-1 text-xs text-gray-500">{doc.desc}</p>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 font-mono text-xs text-gray-700 dark:bg-black/40 dark:text-gray-300">
            <span className="text-brand-navy-light dark:text-brand-gold font-semibold">
              {doc.endpoint}
            </span>
            <button
              onClick={() => handleCopy(doc.endpoint, `${idx}-endpoint`)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              title="Copy Endpoint"
            >
              {copiedText === `${idx}-endpoint` ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="mt-6">
            <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              Parameters
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100 text-gray-500 dark:border-white/5 dark:bg-white/5">
                    <th className="px-4 py-2 font-bold">Parameter</th>
                    <th className="px-4 py-2 font-bold">Type</th>
                    <th className="px-4 py-2 font-bold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {doc.params.map((p, pIdx) => (
                    <tr key={pIdx}>
                      <td className="text-brand-gold px-4 py-2.5 font-mono font-semibold">
                        {p.name}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-gray-500">{p.type}</td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                JSON Output Result
              </h4>
              <button
                onClick={() => handleCopy(doc.response, `${idx}-res`)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                title="Copy JSON Response"
              >
                {copiedText === `${idx}-res` ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <pre className="max-h-60 scrollbar-thin scrollbar-thumb-white/10 overflow-y-auto rounded-lg bg-black/60 p-4 font-mono text-xs text-gray-300">
              {doc.response}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}
