import type { BBALegalContext } from './types';
import { BbaPageFooter } from './BbaPageFooter';
import { BBA_A4_PAGE_STYLE, BBA_A4_PAGE_CLASS } from './bbaA4Styles';
import {
  getProjectLegalLocation,
  getProjectCity as getProjectCityUtil,
} from '@/src/lib/utils/projectLocations';

const getProjectLocation = (projectName: string) => getProjectLegalLocation(projectName, 'en');
const getProjectCity = (projectName: string) => getProjectCityUtil(projectName, 'en');

/**
 * Second page block of the BBA legal preview: title + party identification
 * (Builder / 1st Allottee / 2nd Allottee / 3rd Allottee / Firm / Company)
 * and the Firm's representation recitals.
 */
export function PartiesAndRecitalsPage({ formData, companyInfo }: BBALegalContext) {
  return (
    <>
      <div data-pdf-page="true" className={BBA_A4_PAGE_CLASS} style={BBA_A4_PAGE_STYLE}>
        <p className="mb-1 text-left text-[11.5px] font-bold text-slate-800 underline">
          Note: Please fill the BBA form completely in capital letters.
        </p>
        <div className="mb-2 space-y-1 text-justify text-[11.5px] leading-snug text-slate-700">
          <p>
            The Allottee(s) hereby agrees and confirms to have read, understood and accepted all the
            terms and conditions of this Agreement including the Annexures appended hereto and the
            Allottee(s) hereby agrees and confirms that the Allottee(s) has entered into this
            Agreement with the firm with full knowledge and consent.
          </p>
          <p>
            The Allottee(s) acknowledges that this Agreement has been explained to the Allottee(s)
            in the language understood by the Allottee(s) and the Allottee(s) has fully understood
            the contents of this Agreement.
          </p>
          <p>
            The Allottee(s) hereby agrees and confirms that the Allottee(s) has verified the title
            of the firm in respect of the Said Land and the Said Complex and is satisfied with the
            same.
          </p>
        </div>
        <div className="mb-2 text-center">
          <p className="text-sm font-bold text-[#0f2942] uppercase">
            &quot;{formData?.projectName?.toUpperCase() || ''}&quot;
          </p>
          <p className="text-[11px] font-bold text-slate-600 uppercase">
            {getProjectCity(formData?.projectName)}
          </p>
          <p className="mt-0.5 text-sm font-bold text-[#0f2942] underline">
            BUILDER-BUYER AGREEMENT
          </p>
        </div>
        <p className="mb-1 text-justify text-[12px] leading-snug text-slate-800">
          This Builder Buyer Agreement (hereinafter referred to as the &apos;
          <strong>Agreement</strong>
          &apos;) is executed on this{' '}
          <strong>
            {new Date(formData.bookingDate || Date.now()).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </strong>
          .
        </p>
        <p className="my-1 text-center text-[12.5px] font-bold text-[#0f2942]">BY AND BETWEEN</p>
        <p className="mb-1 text-justify text-[11.5px] leading-snug text-slate-700">
          <strong>M/s. SVI INFRA SOLUTIONS PVT. LTD.,</strong> a company presently having its
          Registered and Corporate Office at <strong>{companyInfo.company_address}</strong>,
          represented by its Authorized Signatory Mr. Iliyas Ali, Director, aged about 41 years
          (hereinafter referred to as the &apos;
          <strong>Company / Firm / Builder / First Party</strong>&apos; which expression shall
          unless repugnant to the context, include its successors, executors, administrators,
          representatives, nominees, assigns, heirs, legal representatives, etc.) of the{' '}
          <strong>FIRST PART;</strong>
        </p>
        <p className="my-1 text-center text-[11.5px] font-bold text-slate-800">AND</p>
        <div className="rounded-md border border-slate-200 bg-slate-50/60 p-2 text-[11.5px]">
          <div className="mb-1 flex items-center justify-between border-b border-slate-200 pb-1">
            <span className="font-bold text-[#0f2942]">1st ALLOTTEE (FOR INDIVIDUALS)</span>
            <span className="text-[10px] font-semibold text-slate-500">SECOND PARTY</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <div>
              <span className="font-medium text-slate-600">Name:</span>{' '}
              <strong className="text-slate-900">
                {formData.salutation ? `${formData.salutation}. ` : ''}
                {formData.clientName}
              </strong>
            </div>
            <div>
              <span className="font-medium text-slate-600">S/o, D/o, W/o:</span>{' '}
              <strong className="text-slate-900">
                {formData.fatherName || '______________________'}
              </strong>
            </div>
            <div>
              <span className="font-medium text-slate-600">Age:</span>{' '}
              <strong className="text-slate-900">
                {formData.age ? `${formData.age} years` : '_______ years'}
              </strong>
            </div>
            <div>
              <span className="font-medium text-slate-600">PAN:</span>{' '}
              <strong className="text-slate-900">
                {formData.panNumber || '______________________'}
              </strong>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-slate-600">Contact:</span>{' '}
              <strong className="text-slate-900">{formData.mobileNumber || '—'}</strong>
              {formData.email && (
                <span className="ml-2">
                  | Email: <strong className="text-slate-900">{formData.email}</strong>
                </span>
              )}
            </div>
            <div className="col-span-2">
              <span className="font-medium text-slate-600">Permanent Address:</span>{' '}
              <strong className="text-slate-900">
                {[
                  formData.addressLine1 || formData.address,
                  formData.addressLine2,
                  formData.city,
                  formData.state,
                  formData.pincode,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </strong>
            </div>
          </div>
        </div>
        <div className="mt-1.5 mb-1 rounded-md border border-l-4 border-slate-200 border-l-[#0f2942] bg-slate-50/70 p-2 text-[11px]">
          <p className="mb-1 text-[11px] font-bold tracking-wider text-[#0f2942] uppercase">
            Nominee Details{' '}
            <span className="text-[10px] font-normal text-slate-500">
              (in the event of demise of the Allottee)
            </span>
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10.5px]">
            <div>
              <span className="font-medium text-slate-600">Nominee Name:</span>{' '}
              <strong className="text-slate-900">
                {formData.nomineeName || '______________________'}
              </strong>
            </div>
            <div>
              <span className="font-medium text-slate-600">Relationship:</span>{' '}
              <strong className="text-slate-900">
                {formData.nomineeRelation || '______________________'}
              </strong>
            </div>
            <div>
              <span className="font-medium text-slate-600">Age:</span>{' '}
              <strong className="text-slate-900">
                {formData.nomineeAge ? `${formData.nomineeAge} years` : '_______ years'}
              </strong>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-slate-600">Nominee Address:</span>{' '}
              <strong className="text-slate-900">
                {formData.nomineeAddress || '____________________________________________'}
              </strong>
            </div>
          </div>
        </div>
        <BbaPageFooter companyInfo={companyInfo} pageNumber={3} />
      </div>
      <div data-pdf-page="true" className={BBA_A4_PAGE_CLASS} style={BBA_A4_PAGE_STYLE}>
        <p className="mb-3 text-center text-[14.5px] font-bold">AND</p>
        <p className="mb-1 text-[14.5px] font-bold">2nd ALLOTTEE</p>
        <p className="mb-1 text-[14.5px]">
          <strong>Name:</strong> ______________________
        </p>
        <p className="mb-1 text-[14.5px]">
          <strong>S/o, D/o, W/o:</strong> ______________________
        </p>
        <p className="mb-1 text-[14.5px]">
          <strong>Age:</strong> _______ years
        </p>
        <p className="mb-2 text-[14.5px]">
          <strong>Address:</strong> ______________________
        </p>
        <p className="mb-3 text-center text-[14.5px] font-bold">AND</p>
        <p className="mb-1 text-[14.5px] font-bold">3rd ALLOTTEE</p>
        <p className="mb-1 text-[14.5px]">
          <strong>Name:</strong> ______________________
        </p>
        <p className="mb-1 text-[14.5px]">
          <strong>S/o, D/o, W/o:</strong> ______________________
        </p>
        <p className="mb-1 text-[14.5px]">
          <strong>Age:</strong> _______ years
        </p>
        <p className="mb-2 text-[14.5px] font-bold">OR</p>
        <p className="mb-1 text-[14.5px] font-bold">(FOR FIRMS)</p>
        <p className="mb-1 text-[14.5px]">
          <strong>M/s.</strong> ______________________
        </p>
        <p className="mb-1 text-[14.5px]">
          <strong>Through its Proprietor / Partner:</strong> ______________________
        </p>
        <p className="mb-1 text-[14.5px]">
          <strong>Address:</strong> ______________________
        </p>
        <p className="mb-2 text-[14.5px] font-bold">OR</p>
        <p className="mb-1 text-[14.5px] font-bold">(FOR COMPANIES)</p>
        <p className="mb-1 text-[14.5px]">
          <strong>M/s.</strong> ______________________
        </p>
        <p className="mb-1 text-[14.5px]">
          <strong>Through its Director / Authorised Signatory:</strong> ______________________
        </p>
        <p className="mb-1 text-[14.5px]">
          <strong>Address:</strong> ______________________
        </p>
        <p className="mb-2 text-[14.5px]">
          (hereinafter referred to as the &apos;Allottee(s)&apos;)
        </p>
        <p className="mb-2 text-justify text-[14.5px] leading-relaxed">
          The party of the FIRST PART and the party of the SECOND PART shall be individually
          referred to as the &apos;<strong>Party</strong>&apos; and collectively referred to as the
          &apos;<strong>Parties</strong>&apos;.
        </p>
        <p className="mb-2 text-[14.5px] font-bold">Firms Representation</p>
        <p className="mb-2 text-justify text-[14.5px] leading-relaxed">
          <strong>WHEREAS</strong> the firm is bona fide purchaser of the land bearing &quot;
          {formData?.projectName?.toUpperCase() || ''}&quot;
          {getProjectLocation(formData?.projectName)
            ? `, ${getProjectLocation(formData?.projectName)} `
            : ' '}
          (hereinafter referred to as the &apos;<strong>Said Land</strong>&apos;).
        </p>
        <p className="mb-2 text-justify text-[14.5px] leading-relaxed">
          <strong>AND WHEREAS</strong> it is clarified that the firm has not intended to convey
          right or interest in any of the land falling outside the Said Building / Said Complex /
          Said Land and no impression of any kind has been given with regard to the constructions
          that may take place on the land outside the Said Land.
        </p>
        <BbaPageFooter companyInfo={companyInfo} pageNumber={4} />
      </div>
    </>
  );
}
