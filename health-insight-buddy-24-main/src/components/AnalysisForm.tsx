import { useState } from "react";
import { Stethoscope, Loader2 } from "lucide-react";
import type { AnalysisInput, AnalysisResult } from "@/types/analysis";

interface Props {
  onResult: (input: AnalysisInput, result: AnalysisResult) => void;
}

const AnalysisForm = ({ onResult }: Props) => {
  const [form, setForm] = useState<AnalysisInput>({
    name: "",
    age: 0,
    gender: "",
    symptoms: "",
    medical_history: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.age || !form.gender || !form.symptoms.trim()) {
      setError("Please fill in Age, Gender, and Symptoms.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://mediai-backend-9nby.onrender.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const result: AnalysisResult = await res.json();
      onResult(form, result);
    } catch {
      setError("Could not connect to the analysis server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] gradient-hero">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center animate-fade-up">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary card-shadow-lg">
            <Stethoscope className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl" style={{ lineHeight: 1.1 }}>
            MediAI — Smart Health Assistant
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Describe your symptoms and get AI-powered health insights instantly.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 max-w-xl rounded-2xl bg-card p-6 md:p-8 card-shadow-lg animate-fade-up animate-fade-up-delay-1"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name <span className="text-muted-foreground">(optional)</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="e.g. Sarah Mitchell"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Age *</label>
              <input
                type="number"
                min={1}
                max={120}
                value={form.age || ""}
                onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="28"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Gender *</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Symptoms *</label>
              <textarea
                rows={4}
                value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
                placeholder="Describe your symptoms in detail..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Medical History <span className="text-muted-foreground">(optional)</span></label>
              <textarea
                rows={2}
                value={form.medical_history}
                onChange={(e) => setForm({ ...form, medical_history: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
                placeholder="Any past conditions, allergies, medications..."
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze My Symptoms"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AnalysisForm;
