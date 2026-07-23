export interface SavedReceipt {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  form_data: {
    receiptNo: string;
    date: string;
    salutation: string;
    name: string;
    refId: string;
    amount: string;
    amountWords: string;
    paymentRef: string;
    drawnOn: string;
    plotNo: string;
    plotSize: string;
    account: string;
    paymentMethod: string;
  };
}
