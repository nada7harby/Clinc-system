import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useUsers } from "@/hooks/useUsers";
import { servicesApi } from "@/api/mockApi";
import { useAuthStore } from "@/store/authStore";
import { Card, Icon, Button, Badge } from "@/components";
import { ROLES, ROUTES, APPOINTMENT_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from "@/constants/appConstants";
import { classNames } from "@/utils";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
const MotionDiv = motion.div;
function BookAppointmentPage() {
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Payment states
  const [paymentPlan, setPaymentPlan] = useState("full"); // full, deposit, clinic, insurance
  const [paymentMethod, setPaymentMethod] = useState("card"); // card, wallet

  // Credit card form states
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardErrors, setCardErrors] = useState({});

  // Insurance details
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState("");

  // Wallet
  const [walletBalance, setWalletBalance] = useState(150.00); // Patient wallet

  // Processing states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const {
    data: doctorsData
  } = useUsers({
    role: ROLES.DOCTOR
  });
  const {
    data: servicesData
  } = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesApi.list()
  });
  const {
    mutate: createAppt
  } = useCreateAppointment();
  const {
    register,
    handleSubmit,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      patientId: user.id,
      patientName: user.name
    }
  });
  const selectedServiceId = watch("serviceId");
  const selectedDoctorId = watch("doctorId");
  const selectedDate = watch("date");
  const selectedTime = watch("time");
  const selectedService = useMemo(() => servicesData?.data.find(s => s.id === selectedServiceId), [servicesData, selectedServiceId]);
  const selectedDoctor = useMemo(() => doctorsData?.data.find(d => d.id === selectedDoctorId), [doctorsData, selectedDoctorId]);
  const handleSelectService = service => {
    setValue("serviceId", service.id);
    setStep(2);
    toast.success(t("pages.patient.bookappointmentpage.serviceSelected", {
      name: service.name
    }));
  };
  const handleSelectDoctor = doctor => {
    setValue("doctorId", doctor.id);
    setStep(3);
    toast.success(t("pages.patient.bookappointmentpage.doctorSelected", {
      name: doctor.name
    }));
  };
  const handleSelectTime = time => {
    setValue("time", time);
    toast.success(t("pages.patient.bookappointmentpage.timeSelected", {
      time
    }));
  };
  const handleReviewSummary = () => {
    if (!selectedDate || !selectedTime) return;
    setStep(4);
  };
  const handleConfirmSummary = e => {
    e.preventDefault();
    setStep(5);
  };

  // Card number input formatting (4 digit spaces)
  const handleCardNumberChange = e => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const matches = value.match(/\d{1,4}/g);
    const matchString = matches ? matches.join(" ") : "";
    setCardNumber(matchString);
    setCardErrors(prev => ({
      ...prev,
      cardNumber: ""
    }));
  };

  // Card expiry formatting (MM/YY)
  const handleCardExpiryChange = e => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
    setCardErrors(prev => ({
      ...prev,
      cardExpiry: ""
    }));
  };
  const handleCardCvvChange = e => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvv(value);
    setCardErrors(prev => ({
      ...prev,
      cardCvv: ""
    }));
  };

  // Payment processing and final mutation logic
  const handlePaymentSubmit = e => {
    e.preventDefault();

    // Check validation if credit card
    if ((paymentPlan === "full" || paymentPlan === "deposit") && paymentMethod === "card") {
      const errs = {};
      if (!cardName.trim()) errs.cardName = t("pages.patient.bookappointmentpage.cardholderNameIsRequired");
      if (cardNumber.replace(/\s/g, "").length !== 16) errs.cardNumber = t("pages.patient.bookappointmentpage.cardNumberMustBe16Digits");
      if (!cardExpiry.includes("/")) errs.cardExpiry = t("pages.patient.bookappointmentpage.expiryDateMustBeMmYy");
      if (cardCvv.length !== 3) errs.cardCvv = t("pages.patient.bookappointmentpage.cvvMustBe3Digits");
      if (Object.keys(errs).length > 0) {
        setCardErrors(errs);
        toast.error(t("pages.patient.bookappointmentpage.pleaseCorrectTheCreditCardDetails"));
        return;
      }
    }

    // Check wallet balance
    const basePrice = selectedService?.price || 0;
    const payPlanAmount = paymentPlan === "full" ? Number((basePrice * 0.95).toFixed(2)) : Number((basePrice * 0.20).toFixed(2));
    if ((paymentPlan === "full" || paymentPlan === "deposit") && paymentMethod === "wallet") {
      if (walletBalance < payPlanAmount) {
        toast.error(t("pages.patient.bookappointmentpage.insufficientWalletBalancePleaseUseCardOr"));
        return;
      }
    }
    if (paymentPlan === "insurance") {
      if (!insuranceProvider) {
        toast.error(t("pages.patient.bookappointmentpage.pleaseSelectAnInsuranceProvider"));
        return;
      }
      if (!insurancePolicyNumber.trim()) {
        toast.error(t("pages.patient.bookappointmentpage.pleaseEnterYourInsurancePolicyNumber"));
        return;
      }
    }

    // Determine final payment details
    let finalStatus = APPOINTMENT_STATUS.PENDING;
    let finalPayStatus = PAYMENT_STATUS.UNPAID;
    let finalPaidAmount = 0;
    if (paymentPlan === "full") {
      finalStatus = APPOINTMENT_STATUS.CONFIRMED;
      finalPayStatus = PAYMENT_STATUS.PAID;
      finalPaidAmount = payPlanAmount;
    } else if (paymentPlan === "deposit") {
      finalStatus = APPOINTMENT_STATUS.CONFIRMED;
      finalPayStatus = PAYMENT_STATUS.DEPOSIT;
      finalPaidAmount = payPlanAmount;
    } else if (paymentPlan === "insurance") {
      finalStatus = APPOINTMENT_STATUS.CONFIRMED;
      finalPayStatus = PAYMENT_STATUS.INSURANCE;
      finalPaidAmount = 0;
    } else {
      // Pay at clinic
      finalStatus = APPOINTMENT_STATUS.PENDING;
      finalPayStatus = PAYMENT_STATUS.UNPAID;
      finalPaidAmount = 0;
    }

    // Start animated processing
    setIsProcessingPayment(true);
    setProcessingStage("Connecting to payment gateway...");
    setTimeout(() => {
      setProcessingStage("Authorizing secure transaction...");
      setTimeout(() => {
        setProcessingStage("Verifying funds and booking slot...");
        setTimeout(() => {
          setProcessingStage("Securing your appointment...");

          // Submit the actual booking!
          const payload = {
            serviceId: selectedServiceId,
            doctorId: selectedDoctorId,
            date: selectedDate,
            time: selectedTime,
            patientName: user.name,
            doctorName: selectedDoctor?.name,
            serviceName: selectedService?.name,
            price: basePrice,
            status: finalStatus,
            paymentStatus: finalPayStatus,
            paymentMethod: paymentPlan === "full" || paymentPlan === "deposit" ? paymentMethod : paymentPlan === "insurance" ? "insurance" : "cash",
            paidAmount: finalPaidAmount,
            insuranceProvider: paymentPlan === "insurance" ? insuranceProvider : undefined,
            insurancePolicyNumber: paymentPlan === "insurance" ? insurancePolicyNumber : undefined
          };
          createAppt(payload, {
            onSuccess: data => {
              // Deduct wallet if paid using wallet
              if ((paymentPlan === "full" || paymentPlan === "deposit") && paymentMethod === "wallet") {
                setWalletBalance(prev => prev - payPlanAmount);
              }
              setIsProcessingPayment(false);
              setBookingSuccessData({
                ...payload,
                id: data.id || `appt_${Math.floor(100000 + Math.random() * 900000)}`,
                txnId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                dateOfPayment: new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })
              });
              setShowReceipt(true);
              toast.success(t("pages.patient.bookappointmentpage.paymentAuthorizedAndSlotSecured"));
            },
            onError: err => {
              setIsProcessingPayment(false);
              toast.error(err.message || t("pages.patient.bookappointmentpage.bookingFailed"));
            }
          });
        }, 800);
      }, 1000);
    }, 1000);
  };
  const steps = [{
    id: 1,
    name: "Service",
    icon: "faStethoscope"
  }, {
    id: 2,
    name: "Doctor",
    icon: "faUserMd"
  }, {
    id: 3,
    name: "Schedule",
    icon: "faClock"
  }, {
    id: 4,
    name: "Confirm",
    icon: "faCheckCircle"
  }, {
    id: 5,
    name: "Payment",
    icon: "faCreditCard"
  }];

  // Printable receipt layout
  if (showReceipt && bookingSuccessData) {
    const remainingBalance = Math.max(0, bookingSuccessData.price - bookingSuccessData.paidAmount);
    return <div className="max-w-2xl mx-auto py-8">
        <MotionDiv initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} className="space-y-8">
          {/* Header Bouncing Success Icon */}
          <div className="text-center space-y-3">
            <MotionDiv initial={{
            scale: 0
          }} animate={{
            scale: [0, 1.2, 1]
          }} transition={{
            duration: 0.5,
            ease: "easeOut"
          }} className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-100/50">
              <Icon name="faCheckCircle" className="text-4xl" />
            </MotionDiv>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{t("pages.patient.bookappointmentpage.bookingConfirmed")}</h1>
            <p className="text-slate-500 font-medium">{t("pages.patient.bookappointmentpage.yourSlotIsSecuredViewDetailsOr")}</p>
          </div>

          {/* Premium Invoice layout */}
          <div id="printable-invoice" className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <div className="absolute right-0 top-0 h-40 w-40 bg-brand-500/5 rounded-bl-full pointer-events-none" />
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
              <div>
                <span className="hud-chip mb-2">{t("pages.patient.bookappointmentpage.receiptInvoice")}</span>
                <p className="text-sm text-slate-400 font-bold mt-1">{t("pages.patient.bookappointmentpage.receiptId")}{bookingSuccessData.txnId}</p>
                <p className="text-xs text-slate-400 font-medium">{t("pages.patient.bookappointmentpage.dateIssued")}{bookingSuccessData.dateOfPayment}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black tracking-tight text-slate-900">{t("pages.patient.bookappointmentpage.medicoreClinic")}</span>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{t("pages.patient.bookappointmentpage.cairoEgyptSupportLine19999")}</p>
              </div>
            </div>

            {/* Patients and doctors */}
            <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-100 text-slate-700">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("pages.patient.bookappointmentpage.patientDetails")}</span>
                <p className="font-bold text-slate-900 mt-1">{bookingSuccessData.patientName}</p>
                <p className="text-xs text-slate-500 font-medium">{t("pages.patient.bookappointmentpage.internalRegisteredClient")}</p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("pages.patient.bookappointmentpage.consultantPractitioner")}</span>
                <p className="font-bold text-slate-900 mt-1">{bookingSuccessData.doctorName}</p>
                <p className="text-xs text-slate-500 font-medium">{t("pages.patient.bookappointmentpage.departmentLeadSpecialist")}</p>
              </div>
            </div>

            {/* Core service and schedule */}
            <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-100 text-slate-700">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("pages.patient.bookappointmentpage.serviceCategory")}</span>
                <p className="font-bold text-slate-900 mt-1">{bookingSuccessData.serviceName}</p>
                <p className="text-xs text-slate-500 font-medium">{t("pages.patient.bookappointmentpage.comprehensiveCheckUpSlot")}</p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("pages.patient.bookappointmentpage.scheduledSchedule")}</span>
                <p className="font-bold text-brand-600 mt-1">{bookingSuccessData.date} @ {bookingSuccessData.time}</p>
                <p className="text-xs text-slate-500 font-medium">{t("pages.patient.bookappointmentpage.arrive10MinutesEarly")}</p>
              </div>
            </div>

            {/* Financial Ledger Details */}
            <div className="py-6 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">{t("pages.patient.bookappointmentpage.financialBreakdown")}</span>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>{t("pages.patient.bookappointmentpage.consultationStandardPrice")}</span>
                  <span className="font-bold text-slate-900">${bookingSuccessData.price}</span>
                </div>
                {bookingSuccessData.paymentStatus === PAYMENT_STATUS.PAID && <div className="flex justify-between text-emerald-600">
                    <span>{t("pages.patient.bookappointmentpage.fullPrepayment5Discount")}</span>
                    <span>-${(bookingSuccessData.price * 0.05).toFixed(2)}</span>
                  </div>}
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
                  <span>{t("pages.patient.bookappointmentpage.totalDueValue")}</span>
                  <span>${bookingSuccessData.paymentStatus === PAYMENT_STATUS.PAID ? (bookingSuccessData.price * 0.95).toFixed(2) : bookingSuccessData.price}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
                  <span>{t("pages.patient.bookappointmentpage.amountPaidSecurely")}</span>
                  <span>${bookingSuccessData.paidAmount}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/50">
                  <span>{t("pages.patient.bookappointmentpage.remainingCashDueAtClinic")}</span>
                  <span>${remainingBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Check-in QR code ticket */}
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
              <div className="space-y-1 text-center sm:text-left">
                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">{t("pages.patient.bookappointmentpage.smartQrCheckIn")}</span>
                <h5 className="text-sm font-bold text-slate-800 mt-1.5">{t("pages.patient.bookappointmentpage.receptionQuickScannerTicket")}</h5>
                <p className="text-xs text-slate-500 font-medium">{t("pages.patient.bookappointmentpage.scanThisBoxBarcodeAtReceptionFor")}</p>
              </div>
              <div className="h-20 w-20 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-sm shrink-0">
                {/* Techy looking QR Mockup */}
                <div className="grid grid-cols-5 gap-0.5 w-full h-full opacity-80">
                  {[...Array(25)].map((_, i) => <div key={i} className={classNames("rounded-[2px]", i % 2 === 0 && i % 3 !== 0 || i === 0 || i === 4 || i === 20 || i === 24 ? "bg-slate-900" : "bg-transparent")} />)}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => window.print()} className="rounded-2xl gap-2 shadow-sm hover:bg-slate-50">
              <Icon name="faPrint" />{t("pages.patient.bookappointmentpage.printReceipt")}</Button>
            <Button onClick={() => navigate(ROUTES.myAppointments)} className="rounded-2xl gap-2 shadow-halo bg-brand-500 text-white">
              <Icon name="faCalendarCheck" />{t("pages.patient.bookappointmentpage.myAppointments")}</Button>
            <Button variant="ghost" onClick={() => {
            setShowReceipt(false);
            setBookingSuccessData(null);
            setStep(1);
            setValue("serviceId", "");
            setValue("doctorId", "");
            setValue("date", "");
            setValue("time", "");
            setCardName("");
            setCardNumber("");
            setCardExpiry("");
            setCardCvv("");
            setInsuranceProvider("");
            setInsurancePolicyNumber("");
          }} className="text-slate-400">{t("pages.patient.bookappointmentpage.bookAnother")}</Button>
          </div>
        </MotionDiv>
      </div>;
  }
  return <div className="mx-auto space-y-8 pb-12 relative">
      {/* Absolute Loading overlay during transaction */}
      <AnimatePresence>
        {isProcessingPayment && <MotionDiv initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
            <div className="space-y-6 text-center max-w-sm px-6">
              <div className="relative h-24 w-24 mx-auto flex items-center justify-center">
                {/* Glowing Spinner Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-brand-500 animate-spin" />
                <Icon name="faShieldAlt" className="text-3xl text-brand-400" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-400 animate-pulse">{t("pages.patient.bookappointmentpage.secureGatewaySync")}</span>
                <h4 className="text-xl font-black tracking-tight">{processingStage}</h4>
                <p className="text-xs text-slate-400 font-medium">{t("pages.patient.bookappointmentpage.pleaseDoNotReloadThePageOr")}</p>
              </div>
            </div>
          </MotionDiv>}
      </AnimatePresence>

      <header className="text-center space-y-4">
        <span className="hud-chip mx-auto">{t("pages.patient.bookappointmentpage.bookingEngine")}</span>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">{t("pages.patient.bookappointmentpage.reserveYourSlot")}</h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">{t("pages.patient.bookappointmentpage.followTheSimpleStepsBelowToSchedule")}</p>
      </header>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 py-6">
        {steps.map(s => <div key={s.id} className="flex items-center gap-4">
            <div className={classNames("h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500", step === s.id ? "bg-brand-500 text-white shadow-halo scale-110" : step > s.id ? "bg-emerald-500 text-white" : "bg-white border-2 border-slate-100 text-slate-300")}>
              <Icon name={step > s.id ? "faCheck" : s.icon} className="text-lg" />
            </div>
            {s.id < 5 && <div className={classNames("h-1 w-12 rounded-full transition-all duration-500", step > s.id ? "bg-emerald-500" : "bg-slate-100")} />}
          </div>)}
      </div>

      <Card variant="premium" className="overflow-hidden">
        <form onSubmit={step === 4 ? handleConfirmSummary : handlePaymentSubmit} className="p-2">
          <AnimatePresence mode="wait">
            {step === 1 && <MotionDiv key="step1" initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -20
          }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicesData?.data.map(service => <div key={service.id} onClick={() => handleSelectService(service)} className={classNames("group cursor-pointer rounded-3xl border-2 p-6 transition-all duration-300 hover:shadow-xl", selectedServiceId === service.id ? "border-brand-500 bg-brand-50/50 shadow-halo" : "border-slate-100 bg-slate-50/30 hover:border-brand-200")}>
                      <div className="flex justify-between items-start">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-500 group-hover:scale-110 transition-transform">
                          <Icon name="faStethoscope" />
                        </div>
                        <span className="text-lg font-black text-slate-900">
                          ${service.price}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-slate-900">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {service.category} • {service.duration || "30"}{t("pages.patient.bookappointmentpage.mins")}</p>
                    </div>)}
                </div>
              </MotionDiv>}

            {step === 2 && <MotionDiv key="step2" initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -20
          }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctorsData?.data.map(doc => <div key={doc.id} onClick={() => handleSelectDoctor(doc)} className={classNames("group cursor-pointer rounded-3xl border-2 p-6 transition-all duration-300 hover:shadow-xl", selectedDoctorId === doc.id ? "border-brand-500 bg-brand-50/50 shadow-halo" : "border-slate-100 bg-slate-50/30 hover:border-brand-200")}>
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-600 font-black text-xl border border-slate-100">
                          {doc.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {doc.name}
                          </h3>
                          <p className="text-xs font-black uppercase tracking-widest text-brand-500">
                            {doc.specialty}
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center gap-2">
                        <Badge tone="success" className="text-[10px] uppercase">{t("pages.patient.bookappointmentpage.availableToday")}</Badge>
                        <span className="text-[10px] font-bold text-slate-400">{t("pages.patient.bookappointmentpage.49120Reviews")}</span>
                      </div>
                    </div>)}
                </div>
                <Button variant="ghost" onClick={() => {
              setStep(1);
              toast("Returning to services...");
            }} className="mt-4">{t("pages.patient.bookappointmentpage.backToServices")}</Button>
              </MotionDiv>}

            {step === 3 && <MotionDiv key="step3" initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -20
          }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("pages.patient.bookappointmentpage.selectDate")}</label>
                    <input type="date" {...register("date", {
                  required: true
                })} min={new Date().toISOString().split("T")[0]} className="w-full h-16 rounded-3xl border-2 border-slate-100 bg-slate-50/50 px-6 text-sm font-bold outline-none focus:border-brand-500 transition-all" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("pages.patient.bookappointmentpage.preferredTime")}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"].map(t => <button key={t} type="button" onClick={() => handleSelectTime(t)} className={classNames("h-12 rounded-xl text-xs font-black transition-all", selectedTime === t ? "bg-brand-500 text-white shadow-lg" : "bg-white border border-slate-100 text-slate-600 hover:border-brand-300")}>
                          {t}
                        </button>)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-6 border-t border-slate-100">
                  <Button variant="ghost" onClick={() => {
                setStep(2);
                toast("Returning to doctor selection...");
              }}>{t("pages.patient.bookappointmentpage.back")}</Button>
                  <Button onClick={handleReviewSummary} disabled={!selectedDate || !selectedTime} className="px-10 h-14">{t("pages.patient.bookappointmentpage.reviewSummary")}</Button>
                </div>
              </MotionDiv>}

            {step === 4 && <MotionDiv key="step4" initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} className="space-y-8">
                <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
                  <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-500/10 blur-3xl" />

                  <div className="relative z-10 grid grid-cols-1 gap-6 p-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">{t("pages.patient.bookappointmentpage.bookingReceipt")}</p>
                          <h3 className="mt-2 text-2xl font-black tracking-tight text-white">{t("pages.patient.bookappointmentpage.appointmentSummary")}</h3>
                        </div>
                        <Badge tone="success" className="uppercase tracking-widest">{t("pages.patient.bookappointmentpage.verifiedAvailable")}</Badge>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{t("pages.patient.bookappointmentpage.patient")}</p>
                          <p className="mt-2 text-lg font-bold">{user.name}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{t("pages.patient.bookappointmentpage.consultant")}</p>
                          <p className="mt-2 text-lg font-bold">
                            {selectedDoctor?.name}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{t("pages.patient.bookappointmentpage.service")}</p>
                          <p className="mt-2 text-lg font-bold text-brand-300">
                            {selectedService?.name}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{t("pages.patient.bookappointmentpage.schedule")}</p>
                          <p className="mt-2 text-lg font-bold">
                            {selectedDate} @ {selectedTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{t("pages.patient.bookappointmentpage.payment")}</p>
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">{t("pages.patient.bookappointmentpage.noHiddenFees")}</span>
                      </div>

                      <div className="mt-6 rounded-2xl bg-white/5 p-5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/50">{t("pages.patient.bookappointmentpage.consultation")}</span>
                          <span className="font-bold text-white">
                            ${selectedService?.price}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-white/50">{t("pages.patient.bookappointmentpage.serviceFee")}</span>
                          <span className="font-bold text-white">$0</span>
                        </div>
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black uppercase tracking-widest text-white/60">{t("pages.patient.bookappointmentpage.total")}</span>
                            <span className="text-3xl font-black">
                              ${selectedService?.price}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button type="submit" className="mt-6 h-14 w-full bg-gradient-to-r from-brand-400 to-brand-600 text-white shadow-xl shadow-brand-500/25 hover:from-brand-500 hover:to-brand-700">{t("pages.patient.bookappointmentpage.proceedToPayment")}</Button>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => {
              setStep(3);
              toast("Editing schedule...");
            }} className="text-slate-400">{t("pages.patient.bookappointmentpage.editSchedule")}</Button>
              </MotionDiv>}

            {step === 5 && <MotionDiv key="step5" initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -20
          }} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-700">
                  {/* Left Column: Payment Plan Selector & Payment Method Options */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Payment Plan */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("pages.patient.bookappointmentpage.1SelectPaymentPlan")}</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[{
                      id: "full",
                      title: t("pages.patient.bookappointmentpage.fullPrepayment"),
                      desc: t("pages.patient.bookappointmentpage.payOnlineNowAndGetA5"),
                      badge: "5% OFF"
                    }, {
                      id: "deposit",
                      title: t("pages.patient.bookappointmentpage.20BookingDeposit"),
                      desc: t("pages.patient.bookappointmentpage.pay20NowToHoldSlotRest"),
                      badge: "Flex Pay"
                    }, {
                      id: "clinic",
                      title: t("pages.patient.bookappointmentpage.payAtClinic"),
                      desc: t("pages.patient.bookappointmentpage.payStandardRateAtClinicReceptionLater"),
                      badge: "In-Person"
                    }, {
                      id: "insurance",
                      title: t("pages.patient.bookappointmentpage.medicalInsurance"),
                      desc: t("pages.patient.bookappointmentpage.submitYourPolicyAndCoverCardsDetails"),
                      badge: "Covered"
                    }].map(p => <div key={p.id} onClick={() => setPaymentPlan(p.id)} className={classNames("cursor-pointer rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between min-h-[100px]", paymentPlan === p.id ? "border-brand-500 bg-brand-50/30 text-slate-800 shadow-halo" : "border-slate-100 bg-white hover:border-brand-200")}>
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-sm text-slate-900">{p.title}</span>
                              <span className={classNames("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", paymentPlan === p.id ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-500")}>{p.badge}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">{p.desc}</p>
                          </div>)}
                      </div>
                    </div>

                    {/* Method Selector (Active if online payment) */}
                    {(paymentPlan === "full" || paymentPlan === "deposit") && <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t("pages.patient.bookappointmentpage.2SelectOnlineMethod")}</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button type="button" onClick={() => setPaymentMethod("card")} className={classNames("h-16 rounded-2xl border flex items-center justify-center gap-3 font-bold transition-all", paymentMethod === "card" ? "border-brand-500 bg-brand-50/30 text-brand-600 shadow-halo" : "border-slate-100 bg-white text-slate-500 hover:border-brand-200")}>
                            <Icon name="faCreditCard" className="text-lg" />
                            <span>{t("pages.patient.bookappointmentpage.creditDebitCard")}</span>
                          </button>
                          <button type="button" onClick={() => setPaymentMethod("wallet")} className={classNames("h-16 rounded-2xl border flex items-center justify-center gap-3 font-bold transition-all", paymentMethod === "wallet" ? "border-brand-500 bg-brand-50/30 text-brand-600 shadow-halo" : "border-slate-100 bg-white text-slate-500 hover:border-brand-200")}>
                            <Icon name="faWallet" className="text-lg" />
                            <div className="text-left leading-none">
                              <p className="text-sm">{t("pages.patient.bookappointmentpage.patientWallet")}</p>
                              <span className="text-[9px] text-slate-400 font-black tracking-tighter">{t("pages.patient.bookappointmentpage.bal")}{walletBalance.toFixed(2)}</span>
                            </div>
                          </button>
                        </div>
                      </div>}

                    {/* Payment Form Area */}
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 min-h-[220px] flex flex-col justify-center">
                      {/* Credit Card Form */}
                      {(paymentPlan === "full" || paymentPlan === "deposit") && paymentMethod === "card" && <div className="space-y-4">
                          <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">{t("pages.patient.bookappointmentpage.cardDetailsEntry")}</span>
                          
                          <div className="space-y-1">
                            <input type="text" value={cardName} onChange={e => {
                        setCardName(e.target.value);
                        setCardErrors(prev => ({
                          ...prev,
                          cardName: ""
                        }));
                      }} placeholder={t("pages.patient.bookappointmentpage.cardholderFullName")} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold outline-none focus:border-brand-500 transition-all shadow-sm" />
                            {cardErrors.cardName && <span className="text-[9px] text-rose-500 font-bold ml-1">{cardErrors.cardName}</span>}
                          </div>

                          <div className="space-y-1">
                            <div className="relative">
                              <input type="text" value={cardNumber} onChange={handleCardNumberChange} placeholder={t("pages.patient.bookappointmentpage.xxxxXxxxXxxxXxxx")} className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-10 text-xs font-bold font-mono outline-none focus:border-brand-500 transition-all shadow-sm" />
                              <Icon name="faCreditCard" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            </div>
                            {cardErrors.cardNumber && <span className="text-[9px] text-rose-500 font-bold ml-1">{cardErrors.cardNumber}</span>}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <input type="text" value={cardExpiry} onChange={handleCardExpiryChange} placeholder={t("pages.patient.bookappointmentpage.mmYy")} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold font-mono text-center outline-none focus:border-brand-500 transition-all shadow-sm" />
                              {cardErrors.cardExpiry && <span className="text-[9px] text-rose-500 font-bold ml-1">{cardErrors.cardExpiry}</span>}
                            </div>
                            <div className="space-y-1">
                              <input type="password" value={cardCvv} onChange={handleCardCvvChange} placeholder={t("pages.patient.bookappointmentpage.cvvPlaceholder")} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold font-mono text-center outline-none focus:border-brand-500 transition-all shadow-sm" />
                              {cardErrors.cardCvv && <span className="text-[9px] text-rose-500 font-bold ml-1">{cardErrors.cardCvv}</span>}
                            </div>
                          </div>
                        </div>}

                      {/* Wallet Summary */}
                      {(paymentPlan === "full" || paymentPlan === "deposit") && paymentMethod === "wallet" && <div className="space-y-4 text-center">
                          <Icon name="faShieldAlt" className="text-3xl text-brand-500 block mx-auto animate-bounce" />
                          <h5 className="text-sm font-bold text-slate-800">{t("pages.patient.bookappointmentpage.secureWalletDebit")}</h5>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">{t("pages.patient.bookappointmentpage.byPayingUsingTheWalletTheAmount")}</p>
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-1.5 text-xs font-bold mt-2">
                            <span>{t("pages.patient.bookappointmentpage.balance")}{walletBalance.toFixed(2)}</span>
                            {walletBalance < (paymentPlan === "full" ? selectedService?.price * 0.95 : selectedService?.price * 0.20) && <span className="text-rose-400 font-black">{t("pages.patient.bookappointmentpage.insufficient")}</span>}
                          </div>
                        </div>}

                      {/* Pay at Clinic Notice */}
                      {paymentPlan === "clinic" && <div className="space-y-3 text-center">
                          <Icon name="faMoneyBillWave" className="text-3xl text-brand-500 block mx-auto" />
                          <h5 className="text-sm font-bold text-slate-800">{t("pages.patient.bookappointmentpage.reserveNowPayAtReception")}</h5>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">{t("pages.patient.bookappointmentpage.noUpfrontChargeTodayYouWillSettle")}</p>
                        </div>}

                      {/* Insurance Cover Form */}
                      {paymentPlan === "insurance" && <div className="space-y-4">
                          <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">{t("pages.patient.bookappointmentpage.insurancePolicyVerification")}</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("pages.patient.bookappointmentpage.provider")}</label>
                              <select value={insuranceProvider} onChange={e => setInsuranceProvider(e.target.value)} className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-brand-500 appearance-none shadow-sm transition-all">
                                <option value="">{t("pages.patient.bookappointmentpage.selectProvider")}</option>
                                <option value="AXA">{t("pages.patient.bookappointmentpage.axaInsurance")}</option>
                                <option value="Bupa">{t("pages.patient.bookappointmentpage.bupaHealth")}</option>
                                <option value="MetLife">{t("pages.patient.bookappointmentpage.metlifeLife")}</option>
                                <option value="Globemed">{t("pages.patient.bookappointmentpage.globemedAlliance")}</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("pages.patient.bookappointmentpage.policyIdNumber")}</label>
                              <input type="text" value={insurancePolicyNumber} onChange={e => setInsurancePolicyNumber(e.target.value)} placeholder={t("pages.patient.bookappointmentpage.eGPol982741")} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold outline-none focus:border-brand-500 transition-all shadow-sm" />
                            </div>
                          </div>
                        </div>}
                    </div>
                  </div>

                  {/* Right Column: Checkout Summary Sidebar */}
                  <div className="lg:col-span-5">
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t("pages.patient.bookappointmentpage.checkoutCart")}</span>
                        <Badge tone="primary" className="uppercase text-[9px] tracking-widest">{t("pages.patient.bookappointmentpage.secured")}</Badge>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">{t("pages.patient.bookappointmentpage.standardConsultationFee")}</span>
                          <span className="font-bold text-slate-900">${selectedService?.price}</span>
                        </div>
                        {paymentPlan === "full" && <div className="flex justify-between items-center text-xs text-emerald-600">
                            <span>{t("pages.patient.bookappointmentpage.prepaymentDiscount5")}</span>
                            <span className="font-bold">-${(selectedService?.price * 0.05).toFixed(2)}</span>
                          </div>}
                        <div className="flex justify-between items-center text-xs">
                          <span>{t("pages.patient.bookappointmentpage.insuranceCopaymentShare")}</span>
                          <span className="font-bold text-slate-900">{paymentPlan === "insurance" ? "20% (Copay)" : "$0.00"}</span>
                        </div>
                        <div className="border-t border-slate-100 my-4" />
                        
                        {/* Total Expected & Due Now */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                            <span>{t("pages.patient.bookappointmentpage.totalExpectedValue")}</span>
                            <span>${paymentPlan === "full" ? (selectedService?.price * 0.95).toFixed(2) : selectedService?.price}</span>
                          </div>
                          
                          {/* Highlight Amount Charged Now */}
                          <div className="rounded-2xl bg-brand-50/50 border border-brand-100/50 p-4 flex justify-between items-center">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 block">{t("pages.patient.bookappointmentpage.amountChargedNow")}</span>
                              <p className="text-2xl font-black text-brand-600 mt-1">
                                ${paymentPlan === "full" ? (selectedService?.price * 0.95).toFixed(2) : paymentPlan === "deposit" ? (selectedService?.price * 0.20).toFixed(2) : "0.00"}
                              </p>
                            </div>
                            <span className="rounded-full bg-brand-100 text-brand-700 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                              {paymentPlan === "full" ? "Paid In Full" : paymentPlan === "deposit" ? "Deposit" : "Pay Later"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pay & Confirm buttons */}
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <Button type="submit" className="w-full h-14 bg-gradient-to-r from-brand-400 to-brand-600 text-white shadow-xl shadow-brand-500/25 hover:from-brand-500 hover:to-brand-700 text-xs font-black uppercase tracking-widest">
                          <Icon name="faShieldAlt" className="mr-2 text-sm" />
                          {paymentPlan === "full" || paymentPlan === "deposit" ? "Complete Secure Checkout" : "Confirm Appointment Reservation"}
                        </Button>
                        <Button variant="ghost" onClick={() => {
                      setStep(4);
                      toast("Returning to review...");
                    }} className="w-full h-12 text-slate-400 hover:text-slate-600">{t("pages.patient.bookappointmentpage.backToReview")}</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </MotionDiv>}
          </AnimatePresence>
        </form>
      </Card>
    </div>;
}
export default BookAppointmentPage;
