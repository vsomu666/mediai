import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { Info, X, Check, ShieldAlert, ArrowLeft, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { AnalysisInput, AnalysisResult } from "@/types/analysis";

interface Props {
  input: AnalysisInput;
  result: AnalysisResult;
  onBack: () => void;
}

const riskConfig = {
  Low: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Medium: { bg: "bg-amber-100", text: "text-amber-700" },
  High: { bg: "bg-red-100", text: "text-red-700" },
};

// ── Convert chart_data object → array for Recharts ────────────────────────────
const toChartArray = (chart_data: any) => {
  if (Array.isArray(chart_data)) return chart_data;
  if (chart_data && typeof chart_data === "object") {
    return [
      { name: "Safe", value: chart_data.safe ?? 0, color: "#10b981" },
      { name: "Moderate", value: chart_data.moderate ?? 0, color: "#f59e0b" },
      { name: "Risk", value: chart_data.risk ?? 0, color: "#ef4444" },
    ];
  }
  return [];
};

const ResultsDashboard = ({ input, result, onBack }: Props) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const risk = riskConfig[result.risk_level as keyof typeof riskConfig] || riskConfig.Low;
  const chartData = toChartArray(result.chart_data);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from("analyses").insert([{
        user_id: user.id,
        name: input.name || "Anonymous",
        age: input.age,
        gender: input.gender,
        symptoms: input.symptoms,
        disease_name: result.disease_name,
        description: result.description,
        risk_level: result.risk_level,
        precautions: result.precautions as never,
        things_to_avoid: result.things_to_avoid as never,
        recommendations: result.recommendations as never,
        chart_data: result.chart_data as never,
      }]);
      setSaved(true);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="rounded-2xl bg-card p-5 card-shadow animate-fade-up flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-foreground">{input.name || "Anonymous"}</p>
            <p className="text-sm text-muted-foreground">{input.age} years · {input.gender}</p>
          </div>
          <span className={`animate-pulse-risk inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ${risk.bg} ${risk.text}`}>
            <ShieldAlert className="h-3.5 w-3.5" />
            {result.risk_level} Risk
          </span>
        </div>

        <div className="mt-6 animate-fade-up animate-fade-up-delay-1">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            {result.disease_name}
            <Info className="h-5 w-5 text-muted-foreground" />
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-prose">{result.description}</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-5 animate-fade-up animate-fade-up-delay-2">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-amber-700">First Aid & Precautions</h3>
            <ul className="space-y-2">
              {result.precautions?.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-amber-900">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-700 text-xs font-bold">{i + 1}</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border-2 border-red-200 bg-red-50/60 p-5 animate-fade-up animate-fade-up-delay-3">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-red-700">What to Avoid</h3>
            <ul className="space-y-2">
              {result.things_to_avoid?.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-red-900">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-5 animate-fade-up animate-fade-up-delay-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-700">Recommendations</h3>
            <ul className="space-y-2">
              {result.recommendations?.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-emerald-900">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-card p-5 card-shadow animate-fade-up animate-fade-up-delay-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Health Stage</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 animate-fade-up animate-fade-up-delay-5">
          <button onClick={onBack} className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-[0.97]">
            <ArrowLeft className="h-4 w-4" /> Analyze Again
          </button>
          <button onClick={handleSave} disabled={saving || saved} className="flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.97] disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saved ? "Saved!" : "Save Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;