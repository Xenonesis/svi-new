'use client';

import { usePaymentReceiptForm } from './hooks/usePaymentReceiptForm';
import PaymentReceiptHeader from './components/PaymentReceiptHeader';
import PaymentReceiptForm from './components/PaymentReceiptForm';
import PaymentReceiptPreview from './components/PaymentReceiptPreview';

export default function PaymentReceiptPage() {
  const {
    formData,
    preview,
    setPreview,
    termsAccepted,
    setTermsAccepted,
    companyInfo,
    isSubmitting,
    handleChange,
    handleResetForm,
    handleSubmit,
    handleDownloadPDF,
    handleDownloadImage,
  } = usePaymentReceiptForm();

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <PaymentReceiptHeader onReset={handleResetForm} />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Form Section */}
        <PaymentReceiptForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
          isSubmitting={isSubmitting}
        />

        {/* Preview Section */}
        <PaymentReceiptPreview
          formData={formData}
          companyInfo={companyInfo}
          preview={preview}
          setPreview={setPreview}
          handleDownloadPDF={handleDownloadPDF}
          handleDownloadImage={handleDownloadImage}
        />
      </div>
    </div>
  );
}
