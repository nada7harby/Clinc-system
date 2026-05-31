import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ROUTES } from "@/constants/appConstants";
import { Button } from "@/components";
import { Icon } from "@/components/Icon";
import heroBg from "@/assets/imgs/bg/abstract-bg-3.webp";
import heroDoctor from "@/assets/imgs/health/staff-10.webp";
import careLobby from "@/assets/imgs/health/facilities-9.webp";
import cardioImg from "@/assets/imgs/health/cardiology-1.webp";
import neuroImg from "@/assets/imgs/health/neurology-3.webp";
import dermImg from "@/assets/imgs/health/dermatology-4.webp";
import pediatricsImg from "@/assets/imgs/health/pediatrics-4.webp";
import orthoImg from "@/assets/imgs/health/orthopedics-4.webp";
import oncologyImg from "@/assets/imgs/health/oncology-2.webp";
import doctorOne from "@/assets/imgs/health/staff-11.webp";
import doctorTwo from "@/assets/imgs/health/staff-14.webp";
import doctorThree from "@/assets/imgs/health/staff-2.webp";
import doctorFour from "@/assets/imgs/health/staff-6.webp";

function CountUp({ value, suffix = "", duration = 1200 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (value - start) * eased);
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(tick);
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}

function StatCard({ item }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4 text-center shadow-sm backdrop-blur transition-all duration-300 hover:shadow-xl"
    >
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
        <Icon name={item.icon} className="text-sm" />
      </div>
      <p className="mt-3 text-2xl font-black text-brand-600">
        <CountUp value={item.value} suffix={item.suffix} />
      </p>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {item.label}
      </p>
    </motion.div>
  );
}

function HomePage() {
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  const stats = [
    {
      label: "Years of care",
      value: 15,
      suffix: "+",
      icon: "faShieldHeart",
    },
    {
      label: "Happy patients",
      value: 5000,
      suffix: "+",
      icon: "faUsers",
    },
    {
      label: "Specialists",
      value: 50,
      suffix: "+",
      icon: "faUserDoctor",
    },
  ];

  const highlights = [
    {
      title: "Personalized Care",
      desc: "We build treatment plans around your lifestyle and goals.",
      icon: "faHandHoldingMedical",
    },
    {
      title: "Expert Teams",
      desc: "Multi-disciplinary specialists collaborate on every case.",
      icon: "faUserDoctor",
    },
    {
      title: "24/7 Support",
      desc: "Virtual check-ins and rapid response when it matters most.",
      icon: "faClock",
    },
  ];

  const departments = [
    {
      title: "Cardiovascular Medicine",
      desc: "Heart health programs, imaging, and preventive diagnostics.",
      icon: "faHeartPulse",
      image: cardioImg,
    },
    {
      title: "Neurological Sciences",
      desc: "Advanced neuro care with precision imaging and therapy plans.",
      icon: "faBrain",
      image: neuroImg,
    },
  ];

  const specialtyGrid = [
    { title: "Orthopedic Surgery", icon: "faBone", image: orthoImg },
    { title: "Pediatric Care", icon: "faChild", image: pediatricsImg },
    { title: "Cancer Treatment", icon: "faRibbon", image: oncologyImg },
    { title: "Dermatology Clinic", icon: "faSpa", image: dermImg },
  ];

  const services = [
    {
      title: "Emergency Care",
      desc: "Immediate response team with critical care specialists.",
    },
    {
      title: "Diagnostics Lab",
      desc: "Same-day imaging, tests, and detailed health reports.",
    },
    {
      title: "Surgery Center",
      desc: "Minimally invasive procedures with rapid recovery support.",
    },
    {
      title: "Telehealth",
      desc: "Secure video consultations from any device, anytime.",
    },
  ];

  const doctors = [
    {
      name: "Dr. Amanda Foster",
      role: "Cardiology",
      rating: "4.9",
      reviews: "1,220 reviews",
      image: doctorOne,
    },
    {
      name: "Dr. Marcus Johnson",
      role: "Neurology",
      rating: "4.8",
      reviews: "980 reviews",
      image: doctorTwo,
    },
    {
      name: "Dr. Rachel Williams",
      role: "Pediatrics",
      rating: "5.0",
      reviews: "1,540 reviews",
      image: doctorThree,
    },
    {
      name: "Dr. David Chen",
      role: "Orthopedics",
      rating: "4.7",
      reviews: "870 reviews",
      image: doctorFour,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative overflow-hidden bg-surface-50">
      <section
        ref={heroRef}
        className="relative px-6 pb-16 pt-16 lg:px-12 lg:pt-24"
      >
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#f6efe9] via-white to-[#edf3f6]" />
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-40 mix-blend-soft-light"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 hidden sm:block"
          style={{ y: shouldReduceMotion ? 0 : parallaxY }}
        >
          <motion.span
            className="absolute left-[6%] top-[8%] h-28 w-28 rounded-full bg-brand-500/12 blur-[1px]"
            animate={
              shouldReduceMotion
                ? undefined
                : { y: [0, -10, 0], opacity: [0.6, 0.9, 0.6] }
            }
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="absolute left-[42%] top-[4%] h-16 w-16 rounded-full bg-emerald-200/50"
            animate={
              shouldReduceMotion
                ? undefined
                : { y: [0, 8, 0], opacity: [0.5, 0.9, 0.5] }
            }
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="absolute right-[18%] top-[8%] h-40 w-40 rounded-full bg-brand-500/10 blur-[1px]"
            animate={
              shouldReduceMotion
                ? undefined
                : { y: [0, -12, 0], opacity: [0.55, 0.9, 0.55] }
            }
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="absolute right-[8%] top-[38%] h-20 w-20 rounded-full bg-slate-200/70" />
          <motion.span
            className="absolute left-[12%] bottom-[10%] h-24 w-24 rounded-full bg-brand-500/10"
            animate={shouldReduceMotion ? undefined : { y: [0, 10, 0] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="absolute right-[32%] bottom-[6%] h-32 w-32 rounded-full bg-rose-200/50 blur-[1px]"
            animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-700"
              >
                <Icon name="faSparkles" className="text-[10px]" />
                Excellence in Healthcare
              </motion.div>
              <motion.h1
                variants={itemVariants}
                className="mt-6 text-4xl font-black tracking-[-0.02em] text-slate-900 sm:text-5xl lg:text-6xl"
              >
                Excellence in{" "}
                <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-400 bg-clip-text text-transparent">
                  Healthcare
                </span>
                <br />
                With Compassionate Care
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="mt-6 max-w-xl text-lg text-slate-600"
              >
                Experience coordinated care, advanced diagnostics, and a team of
                specialists ready to support you at every step.
              </motion.p>
              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Button
                  size="lg"
                  className="group relative overflow-hidden px-8 shadow-xl shadow-brand-500/25 transition-transform duration-300 hover:scale-[1.03]"
                  as={Link}
                  to={ROUTES.register}
                >
                  <span className="relative z-10">Book Appointment</span>
                  <span className="absolute inset-0 -z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="group relative overflow-hidden px-8 transition-all duration-300 hover:bg-brand-500/10"
                  as={Link}
                  to={ROUTES.login}
                >
                  <span className="relative z-10">Watch Our Story</span>
                  <span className="absolute inset-0 -z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[linear-gradient(120deg,rgba(126,99,99,0.08),transparent_70%)]" />
                </Button>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="mt-10 grid grid-cols-3 gap-4 max-w-lg"
              >
                {stats.map((item) => (
                  <StatCard key={item.label} item={item} />
                ))}
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="mt-10 flex flex-wrap gap-6 text-sm font-semibold text-slate-600"
              >
                <span className="flex items-center gap-2">
                  <Icon name="faCircleCheck" className="text-emerald-500" />
                  24/7 Emergency Support
                </span>
                <span className="flex items-center gap-2">
                  <Icon name="faShieldHeart" className="text-emerald-500" />
                  Trusted by 5000+ Patients
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <motion.div
                className="overflow-hidden rounded-[32px] border border-white/70 bg-white/70 shadow-2xl backdrop-blur"
                animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative">
                  <div className="absolute -inset-4 -z-10 rounded-[40px] bg-brand-500/10 blur-2xl" />
                  <img
                    src={heroDoctor}
                    alt="Doctor portrait"
                    className="h-[460px] w-full object-cover"
                  />
                </div>
              </motion.div>
              <motion.div
                className="absolute -left-6 bottom-10 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-xl backdrop-blur"
                animate={shouldReduceMotion ? undefined : { y: [0, 6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Next Available
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Today 02:30 PM
                </p>
              </motion.div>
              <motion.div
                className="absolute -right-6 top-10 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-center shadow-xl backdrop-blur"
                animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  <Icon name="faStar" />
                  <Icon name="faStar" />
                  <Icon name="faStar" />
                  <Icon name="faStar" />
                  <Icon name="faStar" />
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  4.9 from 2.3k reviews
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative">
            <img
              src={careLobby}
              alt="Clinic reception"
              className="h-[420px] w-full rounded-[32px] object-cover shadow-2xl"
            />
            <div className="absolute -bottom-6 left-6 rounded-2xl border border-white/70 bg-white/90 px-5 py-4 shadow-xl backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                24/7 Emergency Care
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Rapid response medical teams ready anytime.
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Compassionate Care, Advanced Medicine
            </p>
            <h2 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">
              Your health journey is guided by trusted experts.
            </h2>
            <p className="mt-4 text-slate-600">
              From primary care to complex procedures, our specialists work as
              one team to deliver coordinated treatment with clear outcomes.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                    <Icon name={item.icon} />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button as={Link} to={ROUTES.register} className="px-8">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Featured Departments
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              Specialized care for every stage of life
            </h2>
            <p className="mt-3 text-slate-500">
              Comprehensive services designed to deliver world-class outcomes.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {departments.map((dept) => (
              <div
                key={dept.title}
                className="group overflow-hidden rounded-[28px] border border-slate-100 bg-surface-50 shadow-sm transition-shadow hover:shadow-xl"
              >
                <div className="h-56 overflow-hidden">
                  <img
                    src={dept.image}
                    alt={dept.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-brand-600">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
                      <Icon name={dept.icon} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {dept.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{dept.desc}</p>
                  <Link
                    to={ROUTES.register}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600"
                  >
                    Explore {dept.title}
                    <Icon name="faArrowRight" className="text-xs" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {specialtyGrid.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                    <Icon name={item.icon} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.title}
                  </h4>
                </div>
                <img
                  src={item.image}
                  alt={item.title}
                  className="mt-4 h-28 w-full rounded-2xl object-cover"
                />
                <Link
                  to={ROUTES.register}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-brand-600"
                >
                  Learn More
                  <Icon name="faChevronRight" className="text-[10px]" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 rounded-[28px] bg-brand-600 px-6 py-8 text-white shadow-glow md:flex-row">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              Emergency Services Available 24/7
            </p>
            <h3 className="mt-2 text-2xl font-bold">
              Our emergency response team is ready to help.
            </h3>
          </div>
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-brand-700 hover:bg-brand-50"
          >
            <Icon name="faPhone" className="mr-2 text-sm" />
            Call Emergency (911)
          </Button>
        </div>
      </section>

      <section className="bg-surface-50 px-6 py-16 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Featured Services
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              Comprehensive healthcare excellence
            </h2>
            <p className="mt-4 text-slate-600">
              From diagnostics to ongoing care, we provide end-to-end support
              for patients and families.
            </p>
            <div className="mt-8 space-y-4">
              {services.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                    <Icon name="faStethoscope" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src={pediatricsImg}
              alt="Doctor with child"
              className="h-[460px] w-full rounded-[32px] object-cover shadow-2xl"
            />
            <div className="absolute -bottom-6 right-6 rounded-2xl border border-white/70 bg-white/90 px-5 py-4 shadow-xl backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                35+ Advanced Treatments
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Personalized plans with measurable outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Find a Doctor
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              Find your perfect healthcare provider
            </h2>
            <p className="mt-3 text-slate-500">
              Search by specialty, location, or availability.
            </p>
          </div>

          <div className="mt-10 grid gap-4 rounded-[28px] border border-slate-100 bg-surface-50 p-6 lg:grid-cols-[1.2fr_1fr_auto]">
            <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white px-4 py-3 shadow-sm">
              <Icon name="faLocationDot" className="text-brand-600" />
              <input
                type="text"
                placeholder="Enter city or zip"
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
              />
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white px-4 py-3 shadow-sm">
              <Icon name="faCalendarDays" className="text-brand-600" />
              <input
                type="text"
                placeholder="Choose specialty"
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
              />
            </div>
            <Button size="lg" className="px-8">
              <Icon name="faMagnifyingGlass" className="mr-2" />
              Find Doctors
            </Button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((doc) => (
              <div
                key={doc.name}
                className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm"
              >
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="h-36 w-full rounded-2xl object-cover"
                />
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-slate-500">{doc.role}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-500">
                    <Icon name="faStar" />
                    {doc.rating}
                    <span className="text-slate-400">({doc.reviews})</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Link
                      to={ROUTES.register}
                      className="text-xs font-semibold text-brand-600"
                    >
                      View Details
                    </Link>
                    <Button size="sm" className="h-9 px-4">
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-50 px-6 py-16 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Excellence in Medical Care, Every Day
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              Dedicated to modern treatment, recovery, and wellbeing.
            </h2>
            <p className="mt-4 text-slate-600">
              Our facility combines advanced technology with compassionate care
              to deliver precise diagnosis and tailored therapies.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Advanced Technology",
                  desc: "Cutting-edge imaging and diagnostics.",
                  icon: "faMicrochip",
                },
                {
                  title: "24/7 Availability",
                  desc: "Clinicians ready across every shift.",
                  icon: "faClock",
                },
                {
                  title: "Expert Team",
                  desc: "Leading specialists and care teams.",
                  icon: "faUserDoctor",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/70 bg-white px-4 py-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                    <Icon name={item.icon} />
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src={cardioImg}
              alt="Medical care"
              className="h-[420px] w-full rounded-[32px] object-cover shadow-2xl"
            />
            <div className="absolute -bottom-6 left-6 rounded-2xl border border-white/70 bg-white/90 px-5 py-4 shadow-xl backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                98% Patient Satisfaction
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Consistent outcomes backed by data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 rounded-[28px] border border-brand-500/20 bg-white px-6 py-10 shadow-premium md:flex-row">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Need Immediate Medical Assistance?
            </p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">
              Our care coordinators are standing by.
            </h3>
          </div>
          <Button size="lg" className="px-8">
            <Icon name="faPhone" className="mr-2" />
            Contact Emergency Team
          </Button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
