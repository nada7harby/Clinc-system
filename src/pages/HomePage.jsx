import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/appConstants";
import { Button } from "@/components";
import { Icon } from "@/components/Icon";

function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary mb-6">
                <Icon name="faBolt" className="mr-2 text-xs" />
                Next-Gen Clinic Management
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:leading-[1.1]">
                Streamline your clinic{" "}
                <span className="text-primary">with ease.</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                MediCore provides everything you need to manage patients,
                appointments, and staff in one intuitive dashboard. Built for
                doctors, loved by patients.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="px-8 shadow-xl shadow-primary/20"
                  as={Link}
                  to={ROUTES.register}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="px-8"
                  as={Link}
                  to={ROUTES.login}
                >
                  Live Demo
                </Button>
              </div>
              <div className="mt-10 flex items-center justify-center gap-6 lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Icon name="faCircleCheck" className="text-emerald-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Icon name="faShieldCheck" className="text-emerald-500" />
                  HIPAA Compliant
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="aspect-video overflow-hidden rounded-2xl bg-slate-200 shadow-2xl ring-1 ring-slate-200">
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 p-8">
                  <Icon
                    name="faHeartPulse"
                    className="text-6xl text-primary animate-pulse"
                  />
                </div>
              </div>
              {/* Decorative Blobs */}
              <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 -z-10 h-64 w-64 rounded-full bg-blue-100 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">
              Why choose MediCore?
            </h2>
            <p className="mt-4 text-slate-600">
              Advanced features tailored for modern healthcare providers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Smart Scheduling",
                desc:
                  "AI-powered booking system that eliminates double bookings.",
              },
              {
                title: "Patient Records",
                desc:
                  "Comprehensive digital health records accessible anywhere.",
              },
              {
                title: "Role-Based Access",
                desc: "Secure permissions for admins, doctors, and staff.",
              },
              {
                title: "Analytics",
                desc:
                  "Detailed insights into revenue, growth, and patient care.",
              },
              {
                title: "Real-time Alerts",
                desc:
                  "Instant notifications for new bookings and cancellations.",
              },
              {
                title: "SaaS Dashboard",
                desc: "Modern, responsive interface designed for productivity.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 font-bold">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
