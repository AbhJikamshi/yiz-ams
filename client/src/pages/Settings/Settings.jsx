import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import settingsService from "../../services/settingsService";

const MONTHS = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Toast
  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Logo upload
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // =========================================================
  // TOAST
  // =========================================================

  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });
  };

  const closeToast = () => {
    setToast({
      show: false,
      type: "",
      message: "",
    });
  };

  useEffect(() => {
    if (!toast.show) return;

    const timer = setTimeout(() => {
      closeToast();
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.show, toast.message]);

  // =========================================================
  // LOAD SETTINGS
  // =========================================================

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const response = await settingsService.getSettings();

      setSettings(response?.data || {});
    } catch (err) {
      console.error("Settings load error:", err);

      showToast(
        "error",
        err.response?.data?.message ||
          "Failed to load association settings."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INPUT HANDLERS
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  // =========================================================
  // LOGO
  // =========================================================

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast(
        "error",
        "Logo must not exceed 5MB."
      );

      event.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showToast(
        "error",
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      );

      event.target.value = "";
      return;
    }

    setLogoFile(file);

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      showToast(
        "error",
        "Please select a logo first."
      );
      return;
    }

    try {
      setUploadingLogo(true);

      const response =
        await settingsService.uploadLogo(logoFile);

      setSettings(response?.data || settings);

      setLogoFile(null);
      setLogoPreview(null);

      showToast(
        "success",
        "Association logo uploaded successfully."
      );
    } catch (err) {
      console.error("Logo upload error:", err);

      showToast(
        "error",
        err.response?.data?.message ||
          "Logo upload failed."
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  const getLogoUrl = () => {
    if (!settings?.associationLogo) {
      return null;
    }

    if (
      settings.associationLogo.startsWith("http://") ||
      settings.associationLogo.startsWith("https://")
    ) {
      return settings.associationLogo;
    }

    return `http://localhost:5000${settings.associationLogo}`;
  };

  // =========================================================
  // SAVE SETTINGS
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response =
        await settingsService.updateSettings(settings);

      setSettings(response?.data || settings);

      showToast(
        "success",
        "Association settings updated successfully."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Settings update error:", err);

      showToast(
        "error",
        err.response?.data?.message ||
          "Failed to update association settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading association settings...
            </p>

          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =========================================================
  // STYLES
  // =========================================================

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  const sectionClass =
    "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <DashboardLayout>

      {/* =====================================================
          TOAST NOTIFICATION
      ===================================================== */}

      <div
        className={`fixed right-5 top-5 z-[9999] w-[calc(100%-2.5rem)] max-w-sm transform transition-all duration-300 ${
          toast.show
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-8 opacity-0"
        }`}
      >

        <div
          className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl ${
            toast.type === "success"
              ? "border-emerald-200"
              : "border-red-200"
          }`}
        >

          {/* ICON */}

          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold ${
              toast.type === "success"
                ? "bg-emerald-100 text-emerald-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {toast.type === "success"
              ? "✓"
              : "!"}
          </div>

          {/* MESSAGE */}

          <div className="min-w-0 flex-1">

            <p
              className={`text-sm font-bold ${
                toast.type === "success"
                  ? "text-emerald-800"
                  : "text-red-800"
              }`}
            >
              {toast.type === "success"
                ? "Success"
                : "Error"}
            </p>

            <p className="mt-1 text-sm leading-5 text-slate-600">
              {toast.message}
            </p>

          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={closeToast}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close notification"
          >
            ×
          </button>

        </div>

        {/* PROGRESS BAR */}

        {toast.show && (
          <div
            className={`h-1 origin-left animate-[toastProgress_4s_linear_forwards] rounded-b-2xl ${
              toast.type === "success"
                ? "bg-emerald-500"
                : "bg-red-500"
            }`}
          />
        )}

      </div>

      <div className="mx-auto max-w-6xl pb-16">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="mb-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
                <span>⚙️</span>
                <span>Administration</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Association Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage your association profile, payment information,
                contributions, executives, meetings and financial
                configuration.
              </p>

            </div>

            <div className="hidden rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 sm:block">

              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Configuration
              </p>

              <p className="mt-1 text-sm font-bold text-blue-900">
                Association Profile
              </p>

            </div>

          </div>

        </div>

        {/* =====================================================
            FORM
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* =====================================================
              ASSOCIATION INFORMATION
          ===================================================== */}

          <section className={sectionClass}>

            <div className="border-b border-slate-100 px-6 py-5 sm:px-7">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  🏢
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Association Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Basic information displayed throughout YIZ-AMS.
                  </p>

                </div>

              </div>

            </div>

            <div className="space-y-6 p-6 sm:p-7">

              <div>

                <label className={labelClass}>
                  Association Name
                </label>

                <input
                  type="text"
                  name="associationName"
                  value={settings?.associationName || ""}
                  onChange={handleChange}
                  required
                  placeholder="Enter association name"
                  className={inputClass}
                />

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className={labelClass}>
                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={settings?.phone || ""}
                    onChange={handleChange}
                    placeholder="Association phone number"
                    className={inputClass}
                  />

                </div>

                <div>

                  <label className={labelClass}>
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={settings?.email || ""}
                    onChange={handleChange}
                    placeholder="association@example.com"
                    className={inputClass}
                  />

                </div>

                <div>

                  <label className={labelClass}>
                    Website
                  </label>

                  <input
                    type="text"
                    name="website"
                    value={settings?.website || ""}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className={inputClass}
                  />

                </div>

                <div>

                  <label className={labelClass}>
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={settings?.address || ""}
                    onChange={handleChange}
                    placeholder="Association address"
                    className={inputClass}
                  />

                </div>

              </div>

              {/* LOGO */}

              <div className="border-t border-slate-100 pt-6">

                <div className="mb-4">

                  <h3 className="font-bold text-slate-900">
                    Association Logo
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    This logo can be used on receipts, statements
                    and association documents.
                  </p>

                </div>

                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5">

                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                    <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="h-full w-full object-contain p-2"
                        />
                      ) : getLogoUrl() ? (
                        <img
                          src={getLogoUrl()}
                          alt="Association Logo"
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <div className="text-center">

                          <div className="text-3xl">
                            🏢
                          </div>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            No Logo
                          </p>

                        </div>
                      )}

                    </div>

                    <div className="flex-1">

                      <label className={labelClass}>
                        Select New Logo
                      </label>

                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleLogoChange}
                        className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-blue-50 file:px-4 file:py-3 file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                      />

                      {logoFile && (
                        <div className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">

                          <span className="font-semibold">
                            Selected:
                          </span>{" "}
                          {logoFile.name}

                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-3">

                        <button
                          type="button"
                          onClick={handleLogoUpload}
                          disabled={
                            !logoFile ||
                            uploadingLogo
                          }
                          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {uploadingLogo
                            ? "Uploading..."
                            : "Upload Logo"}
                        </button>

                        <span className="text-xs text-slate-400">
                          JPG, PNG or WEBP • Max 5MB
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              PAYMENT ACCOUNT
          ===================================================== */}

          <section className={sectionClass}>

            <div className="border-b border-slate-100 px-6 py-5 sm:px-7">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  💳
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Payment Account
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Bank details members use when making manual
                    contribution payments.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6 sm:p-7">

              <div className="grid gap-5 md:grid-cols-3">

                <div>

                  <label className={labelClass}>
                    Bank
                  </label>

                  <input
                    type="text"
                    name="bankName"
                    value={settings?.bankName || ""}
                    onChange={handleChange}
                    placeholder="e.g. Opay"
                    className={inputClass}
                  />

                </div>

                <div>

                  <label className={labelClass}>
                    Account Name
                  </label>

                  <input
                    type="text"
                    name="accountName"
                    value={settings?.accountName || ""}
                    onChange={handleChange}
                    placeholder="Account holder name"
                    className={inputClass}
                  />

                </div>

                <div>

                  <label className={labelClass}>
                    Account Number
                  </label>

                  <input
                    type="text"
                    name="accountNumber"
                    value={settings?.accountNumber || ""}
                    onChange={handleChange}
                    placeholder="Account number"
                    className={inputClass}
                  />

                </div>

              </div>

              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">

                <p className="text-sm font-semibold text-amber-800">
                  Payment information
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Make sure these details are correct before
                  displaying them to members.
                </p>

              </div>

            </div>

          </section>

          {/* =====================================================
              CONTRIBUTION SETTINGS
          ===================================================== */}

          <section className={sectionClass}>

            <div className="border-b border-slate-100 px-6 py-5 sm:px-7">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-xl">
                  💰
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Contribution Settings
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Configure monthly contribution rules and
                    collection periods.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6 sm:p-7">

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className={labelClass}>
                    Monthly Contribution
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      ₦
                    </span>

                    <input
                      type="number"
                      name="monthlyContributionAmount"
                      value={
                        settings?.monthlyContributionAmount ?? ""
                      }
                      onChange={handleNumberChange}
                      min="0"
                      required
                      className={`${inputClass} pl-9`}
                    />

                  </div>

                </div>

                <div>

                  <label className={labelClass}>
                    Currency
                  </label>

                  <input
                    type="text"
                    name="currency"
                    value={settings?.currency || "NGN"}
                    onChange={handleChange}
                    className={inputClass}
                  />

                </div>

                <div>

                  <label className={labelClass}>
                    Collection Start Month
                  </label>

                  <select
                    name="contributionStartMonth"
                    value={
                      settings?.contributionStartMonth ?? 12
                    }
                    onChange={handleNumberChange}
                    className={inputClass}
                  >
                    {MONTHS.slice(1).map(
                      (month, index) => (
                        <option
                          key={month}
                          value={index + 1}
                        >
                          {month}
                        </option>
                      )
                    )}
                  </select>

                </div>

                <div>

                  <label className={labelClass}>
                    Collection Start Year
                  </label>

                  <input
                    type="number"
                    name="contributionStartYear"
                    value={
                      settings?.contributionStartYear ?? 2024
                    }
                    onChange={handleNumberChange}
                    min="2000"
                    max="2100"
                    className={inputClass}
                  />

                </div>

              </div>

              <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">

                <div className="flex items-start gap-4">

                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    📅
                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                      Contribution Collection Period
                    </p>

                    <p className="mt-1 text-lg font-extrabold text-blue-950">
                      Starting from{" "}
                      {
                        MONTHS[
                          Number(
                            settings?.contributionStartMonth || 12
                          )
                        ] || "December"
                      }{" "}
                      {settings?.contributionStartYear || 2024}
                    </p>

                    <p className="mt-1 text-sm text-blue-700">
                      Members are expected to contribute from
                      this period onward.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              EXECUTIVES
          ===================================================== */}

          <section className={sectionClass}>

            <div className="border-b border-slate-100 px-6 py-5 sm:px-7">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">
                  👥
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Association Executives
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current leadership information for the
                    association.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6 sm:p-7">

              <div className="grid gap-5 md:grid-cols-3">

                <div>

                  <label className={labelClass}>
                    Chairman
                  </label>

                  <input
                    type="text"
                    name="chairmanName"
                    value={settings?.chairmanName || ""}
                    onChange={handleChange}
                    placeholder="Chairman's name"
                    className={inputClass}
                  />

                </div>

                <div>

                  <label className={labelClass}>
                    Secretary
                  </label>

                  <input
                    type="text"
                    name="secretaryName"
                    value={settings?.secretaryName || ""}
                    onChange={handleChange}
                    placeholder="Secretary's name"
                    className={inputClass}
                  />

                </div>

                <div>

                  <label className={labelClass}>
                    Treasurer
                  </label>

                  <input
                    type="text"
                    name="treasurerName"
                    value={settings?.treasurerName || ""}
                    onChange={handleChange}
                    placeholder="Treasurer's name"
                    className={inputClass}
                  />

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              MEETING INFORMATION
          ===================================================== */}

          <section className={sectionClass}>

            <div className="border-b border-slate-100 px-6 py-5 sm:px-7">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-xl">
                  🗓️
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Meeting Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Configure the association's regular meeting
                    schedule.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6 sm:p-7">

              <div className="grid gap-5 md:grid-cols-3">

                <div>

                  <label className={labelClass}>
                    Meeting Day
                  </label>

                  <input
                    type="text"
                    name="meetingDay"
                    value={settings?.meetingDay || ""}
                    onChange={handleChange}
                    placeholder="e.g. Last Sunday"
                    className={inputClass}
                  />

                </div>

                <div>

                  <label className={labelClass}>
                    Meeting Time
                  </label>

                  <input
                    type="text"
                    name="meetingTime"
                    value={settings?.meetingTime || ""}
                    onChange={handleChange}
                    placeholder="e.g. 7:00 PM"
                    className={inputClass}
                  />

                </div>

                <div>

                  <label className={labelClass}>
                    Meeting Venue
                  </label>

                  <input
                    type="text"
                    name="meetingVenue"
                    value={settings?.meetingVenue || ""}
                    onChange={handleChange}
                    placeholder="Meeting location"
                    className={inputClass}
                  />

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              FINANCIAL YEAR
          ===================================================== */}

          <section className={sectionClass}>

            <div className="border-b border-slate-100 px-6 py-5 sm:px-7">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  📊
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Financial Year
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Define the financial reporting period used
                    by the association.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6 sm:p-7">

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className={labelClass}>
                    Start Year
                  </label>

                  <input
                    type="number"
                    name="financialYearStart"
                    value={
                      settings?.financialYearStart ?? ""
                    }
                    onChange={handleNumberChange}
                    min="2000"
                    max="2100"
                    className={inputClass}
                  />

                </div>

                <div>

                  <label className={labelClass}>
                    End Year
                  </label>

                  <input
                    type="number"
                    name="financialYearEnd"
                    value={
                      settings?.financialYearEnd ?? ""
                    }
                    onChange={handleNumberChange}
                    min="2000"
                    max="2100"
                    className={inputClass}
                  />

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              DOCUMENT PREFIXES
          ===================================================== */}

          <section className={sectionClass}>

            <div className="border-b border-slate-100 px-6 py-5 sm:px-7">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                  🧾
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Document Number Prefixes
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Customize the prefixes used for financial
                    documents and records.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6 sm:p-7">

              <div className="grid gap-5 md:grid-cols-3">

                <div>

                  <label className={labelClass}>
                    Receipt Prefix
                  </label>

                  <input
                    type="text"
                    name="receiptPrefix"
                    value={
                      settings?.receiptPrefix || ""
                    }
                    onChange={handleChange}
                    placeholder="RCT"
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Example: RCT-00001
                  </p>

                </div>

                <div>

                  <label className={labelClass}>
                    Contribution Prefix
                  </label>

                  <input
                    type="text"
                    name="contributionPrefix"
                    value={
                      settings?.contributionPrefix || ""
                    }
                    onChange={handleChange}
                    placeholder="CON"
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Example: CON-00001
                  </p>

                </div>

                <div>

                  <label className={labelClass}>
                    Expense Prefix
                  </label>

                  <input
                    type="text"
                    name="expensePrefix"
                    value={
                      settings?.expensePrefix || ""
                    }
                    onChange={handleChange}
                    placeholder="EXP"
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Example: EXP-00001
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              SAVE BAR
          ===================================================== */}

          <div className="sticky bottom-4 z-20">

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">

              <div className="hidden sm:block">

                <p className="text-sm font-bold text-slate-900">
                  Save your changes
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Changes will be applied to the association
                  configuration.
                </p>

              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
              >

                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Save Settings
                  </>
                )}

              </button>

            </div>

          </div>

        </form>
      </div>

      {/* =====================================================
          TOAST ANIMATION
      ===================================================== */}

      <style>
        {`
          @keyframes toastProgress {
            from {
              transform: scaleX(1);
            }

            to {
              transform: scaleX(0);
            }
          }
        `}
      </style>

    </DashboardLayout>
  );
};

export default Settings;