import { useEffect, useState } from "react";

import PaymentUploadForm from "../components/PaymentUploadForm";
import PaymentRequestHistory from "../components/PaymentRequestHistory";

import {
  getMyPaymentRequests,
  submitPaymentRequest,
  uploadPaymentProof,
} from "../../services/paymentRequestService";

import settingsService from "../../services/settingsService";

export default function MemberPaymentPage() {
  const [requests, setRequests] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      setLoading(true);

      const [paymentResponse, settingsResponse] =
        await Promise.all([
          getMyPaymentRequests(),
          settingsService.getMemberSettings(),
        ]);

      setRequests(
        paymentResponse?.data ?? paymentResponse ?? []
      );

      setSettings(
        settingsResponse?.data ??
          settingsResponse ??
          null
      );
    } catch (error) {
      console.error(
        "Member Payment Page Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    form,
    file,
    setProgress
  ) => {
    setProgress(20);

    const paymentResponse =
      await submitPaymentRequest(form);

    const payment =
      paymentResponse?.data ?? paymentResponse;

    setProgress(60);

    if (!payment?.id) {
      throw new Error(
        "Payment request was created, but no payment ID was returned."
      );
    }

    await uploadPaymentProof(
      payment.id,
      file
    );

    setProgress(100);

    await loadPage();
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-gray-500 dark:text-gray-400">
          Loading payment page...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-28 pt-20 sm:p-6 sm:pb-28 sm:pt-20 lg:p-8 lg:pb-28 lg:pt-8">
      <div className="mx-auto max-w-4xl">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Monthly Contribution
          </h1>

          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Submit your monthly contribution and payment proof.
          </p>
        </div>

        <PaymentUploadForm
          settings={settings}
          existingRequests={requests}
          onSubmit={handleSubmit}
        />

        <PaymentRequestHistory
          requests={requests}
        />

      </div>
    </div>
  );
}