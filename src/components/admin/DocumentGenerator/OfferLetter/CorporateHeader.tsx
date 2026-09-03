import { CompanyInfo } from './types';

interface CorporateHeaderProps {
  companyInfo: CompanyInfo;
  language?: 'en' | 'hi';
}

export default function CorporateHeader({ companyInfo, language = 'en' }: CorporateHeaderProps) {
  return (
    <div className="mb-2 grid grid-cols-[1fr_auto] items-start gap-4 border-b-2 border-[#1e3a8a] pb-1.5">
      <div>
        <h1 className="text-[21px] leading-tight font-bold tracking-wide text-[#1e3a8a] uppercase">
          {companyInfo.company_name}
        </h1>
        <p className="mt-0.5 text-[11.5px] font-semibold text-gray-800">
          {language === 'hi'
            ? 'कॉर्पोरेट रियल एस्टेट, इंफ्रास्ट्रक्चर एडवाइजरी एवं रणनीतिक परियोजना विकास'
            : 'Corporate Real Estate, Infrastructure Advisory & Strategic Project Development'}
        </p>
        <p className="mt-0.5 text-[11px] text-gray-700">
          {language === 'hi' ? 'संपर्क:' : 'Contact:'}{' '}
          <span className="font-bold text-gray-900">{companyInfo.company_phone}</span> &nbsp;|&nbsp;{' '}
          {language === 'hi' ? 'ईमेल:' : 'Email:'}{' '}
          <span className="font-bold text-gray-900">{companyInfo.company_email}</span> &nbsp;|&nbsp;{' '}
          {language === 'hi' ? 'वेबसाइट:' : 'Web:'}{' '}
          <span className="font-bold text-gray-900">{companyInfo.company_website}</span>
        </p>
        <p className="text-[10.5px] text-gray-600">
          {language === 'hi' ? 'कार्यालय:' : 'Office:'} {companyInfo.company_address}
        </p>
      </div>
      <div className="w-20 flex-shrink-0 text-right">
        <img
          src="/icons/icon-512x512.png"
          alt={companyInfo.company_name}
          className="ml-auto h-14 w-14 rounded-xs object-contain"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      </div>
    </div>
  );
}
