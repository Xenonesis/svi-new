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
        <p className="mb-2 text-left text-[14.5px] font-bold underline">
          Note: Please fill the BBA form completely in capital letters.
        </p>
        <p className="mb-2 text-justify text-[14.5px] leading-relaxed">
          The Allottee(s) hereby agrees and confirms to have read, understood and accepted all the
          terms and conditions of this Agreement including the Annexures appended hereto and the
          Allottee(s) hereby agrees and confirms that the Allottee(s) has entered into this
          Agreement with the firm with full knowledge and consent.
        </p>
        <p className="mb-2 text-justify text-[14.5px] leading-relaxed">
          The Allottee(s) acknowledges that this Agreement has been explained to the Allottee(s) in
          the language understood by the Allottee(s) and the Allottee(s) has fully understood the
          contents of this Agreement.
        </p>
        <p className="mb-2 text-justify text-[14.5px] leading-relaxed">
          The Allottee(s) hereby agrees and confirms that the Allottee(s) has verified the title of
          the firm in respect of the Said Land and the Said Complex and is satisfied with the same.
        </p>
        <p className="mb-2 text-center text-lg font-bold uppercase">
          "{formData?.projectName?.toUpperCase() || ''}"
        </p>
        <p className="mb-2 text-center text-sm font-bold uppercase">
          {getProjectCity(formData?.projectName)}
        </p>
        <p className="mb-2 text-center text-xl font-bold underline">BUILDER-BUYER AGREEMENT</p>
        <p className="mb-2 text-justify text-[14.5px] leading-relaxed">
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
        <p className="my-2 text-center text-lg font-bold">BY AND BETWEEN</p>
        <p className="mb-2 text-justify text-[14.5px] leading-relaxed">
          <strong>M/s. SVI INFRA SOLUTIONS PVT. LTD.,</strong> a company presently having its
          Registered and Corporate Office at <strong>{companyInfo.company_address}</strong>,
          represented by its Authorized Signatory Mr. Vineet Narnawat, Director, aged about 43
          years, S/o Sh. Ramesh Chand Narnawat, R/o H. No. 162, VPO-Badhal, Th.-Chomu, Dist. Jaipur,
          Rajasthan (hereinafter referred to as the &apos;
          <strong>Company / Firm / Builder / First Party</strong>&apos; which expression shall
          unless repugnant to the context, include its successors, executors, administrators,
          representatives, nominees, assigns, heirs, legal representatives, etc.) of the{' '}
          <strong>FIRST PART;</strong>
        </p>
        <p className="my-3 text-center text-[14.5px] font-bold">AND</p>
        <p className="mb-0 text-[14.5px]">(FOR INDIVIDUALS)</p>
        <p className="mb-2 text-[14.5px]">1st ALLOTTEE</p>
        <p className="mb-1 text-[14.5px]">
          <strong>Name:</strong> {formData.salutation ? `${formData.salutation}. ` : ''}
          {formData.clientName}
        </p>
        <p className="mb-1 text-[14.5px]">
          <strong>S/o, D/o, W/o:</strong> {formData.fatherName || '______________________'}
        </p>
        <p className="mb-1 text-[14.5px]">
          <strong>Age:</strong> {formData.age ? `${formData.age} years` : '_______ years'}
        </p>
        <p className="mb-1 text-[14.5px]">
          <strong>PAN:</strong> {formData.panNumber || '______________________'}
        </p>
        <p className="mb-1 text-[14.5px]">
          <strong>Contact:</strong> {formData.mobileNumber || '______________________'}
          {formData.email ? ` | Email: ${formData.email}` : ' | Email: ______________________'}
        </p>
        <p className="mb-1 text-[14.5px] font-bold">Permanent Address:</p>
        <p className="mb-1 text-[14.5px]">
          {formData.addressLine1 || formData.address}
          {formData.addressLine2 ? `, ${formData.addressLine2}` : ''}
        </p>
        <p className="mb-2 text-[14.5px] font-bold">
          {[formData.city, formData.state, formData.pincode].filter(Boolean).join(', ')}
        </p>
        <div className="mt-3 mb-2 rounded-lg border border-l-4 border-slate-200 border-l-[#0f2942] bg-slate-50/70 p-3">
          <p className="mb-2 text-[13px] font-bold tracking-wider text-[#0f2942] uppercase">
            Nominee Details{' '}
            <span className="text-[11.5px] font-normal text-slate-600">
              (in the event of demise of the Allottee)
            </span>
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13.5px]">
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
