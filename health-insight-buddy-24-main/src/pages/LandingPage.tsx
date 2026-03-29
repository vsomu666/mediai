import { useNavigate } from "react-router-dom";
import { Stethoscope, Zap, ShieldCheck, History, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    { icon: Zap, title: "Instant Diagnosis", desc: "Get AI-powered health insights in seconds from your symptom description." },
    { icon: ShieldCheck, title: "Risk Assessment", desc: "Understand your health risk level with clear visual indicators and charts." },
    { icon: History, title: "Personal Health History", desc: "Track all your analyses over time and monitor your health journey." },
  ];

  const steps = [
    { num: "01", title: "Enter Symptoms", desc: "Describe what you're experiencing in detail." },
    { num: "02", title: "AI Analysis", desc: "Our AI processes your symptoms against medical knowledge." },
    { num: "03", title: "Get Report", desc: "Receive a comprehensive health report with recommendations." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Medi<span className="text-primary">AI</span>
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(user ? "/dashboard" : "/login")}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors active:scale-[0.97]"
            >
              {user ? "Dashboard" : "Sign In"}
            </button>
            {!user && (
              <button
                onClick={() => navigate("/signup")}
                className="rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.97]"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-hero">
        <div className="container mx-auto px-4 py-20 md:py-32 text-center">
          <div className="mx-auto max-w-3xl animate-fade-up">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl gradient-primary card-shadow-lg">
              <Stethoscope className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl" style={{ lineHeight: 1.08 }}>
              MediAI — AI-Powered Health Assistant
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground" style={{ textWrap: "balance" as never }}>
              Describe your symptoms, get instant AI analysis, risk assessment, and personalized health recommendations.
            </p>
            <button
              onClick={() => navigate(user ? "/dashboard" : "/signup")}
              className="mt-8 inline-flex items-center gap-2 rounded-xl gradient-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:shadow-xl hover:shadow-primary/25 active:scale-[0.97]"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl animate-fade-up">Why MediAI?</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="rounded-2xl bg-card p-6 card-shadow animate-fade-up"
                style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl animate-fade-up">How It Works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="text-center animate-fade-up"
                style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
              >
                <span className="text-4xl font-extrabold text-primary/20">{s.num}</span>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">MediAI</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Smart Health Assistant — For informational purposes only.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
