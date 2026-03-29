import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, ShieldAlert, Eye, Loader2, X as XIcon, Info, Check } from "lucide-react";
import { X } from "lucide-react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import Navbar from "@/components/Navbar";
import type { SavedAnalysis } from "@/types/analysis";

const riskFilters = ["All", "Low", "Medium", "High"] as const;

const HistoryPage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const [viewing, setViewing] = useState<SavedAnalysis | null>(null);

  const fetchRecords = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setRecords(
        data.map((d) => ({
          id: d.id,
          created_at: d.created_at,
          name: d.name ?? "",
          age: d.age ?? 0,
          gender: d.gender ?? "",
          symptoms: d.symptoms ?? "",
          medical_history: "",
          disease_name: d.disease_name ?? "",
          description: d.description ?? "",
          risk_level: (d.risk_level as "Low" | "Medium" | "High") ?? "Low",
          precautions: (d.precautions as unknown as string[]) ?? [],
          things_to_avoid: (d.things_to_avoid as unknown as string[]) ?? [],
          recommendations: (d.recommendations as unknown as string[]) ?? [],
          chart_data: (d.chart_data as unknown as { name: string; value: number; color: string }[]) ?? [],
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const handleDelete = async (id: string) => {
    await supabase.from("analyses").delete().eq("id", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (viewing?.id === id) setViewing(null);
  };

  const filtered = filter === "All" ? records : records.filter((r) => r.risk_level === filter);

  const riskColor: Record<string, string> = {
    Low: "bg-emerald-100 text-emerald-700",
    Medium: "bg-amber-100 text-amber-700",
    High: "bg-red-100 text-red-700",
  };

  const riskConfig: Record<string, { bg: string; text: string }> = {
    Low: { bg: "bg-emerald-100", text: "text-emerald-700" },
    Medium: { bg: "bg-amber-100", text: "text-amber-700" },
    High: { bg: "bg-red-100", text: "text-red-700" },
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-up">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analysis History</h1>
              <p className="mt-1 text-sm text-muted-foreground">View and manage your past analyses.</p>
            </div>
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {riskFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    filter === f ? "bg-card text-foreground card-shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="mt-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="mt-16 text-center">
              <p className="text-muted-foreground">
                {records.length === 0 ? "No analyses saved yet." : "No analyses match this filter."}
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-2">
              {filtered.map((r, i) => (
                <div
                  key={r.id}
                  className="rounded-xl bg-card p-4 card-shadow flex flex-wrap items-center gap-4 animate-fade-up"
                  style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{r.disease_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()} · {r.symptoms.slice(0, 60)}{r.symptoms.length > 60 ? "…" : ""}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${riskColor[r.risk_level] || ""}`}>
                    <ShieldAlert className="h-3 w-3" />
                    {r.risk_level}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setViewing(r)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-[0.95]"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors active:scale-[0.95]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={() => setViewing(null)}>
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card p-6 card-shadow-lg animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setViewing(null)} className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <XIcon className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  {viewing.disease_name} <Info className="h-4 w-4 text-muted-foreground" />
                </h2>
                <p className="text-sm text-muted-foreground">{viewing.name || "Anonymous"} · {viewing.age} years · {viewing.gender}</p>
              </div>
              <span className={`ml-auto animate-pulse-risk inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${riskConfig[viewing.risk_level]?.bg} ${riskConfig[viewing.risk_level]?.text}`}>
                <ShieldAlert className="h-3 w-3" /> {viewing.risk_level} Risk
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{viewing.description}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50/60 p-4">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-700">Precautions</h3>
                <ul className="space-y-1.5">
                  {viewing.precautions?.map((p, i) => (
                    <li key={i} className="text-sm text-amber-900 flex gap-2"><span className="font-bold text-amber-600">{i+1}.</span>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border-2 border-red-200 bg-red-50/60 p-4">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-red-700">Avoid</h3>
                <ul className="space-y-1.5">
                  {viewing.things_to_avoid?.map((t, i) => (
                    <li key={i} className="text-sm text-red-900 flex gap-2"><X className="h-3.5 w-3.5 mt-0.5 shrink-0 text-red-500" />{t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/60 p-4">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">Recommendations</h3>
                <ul className="space-y-1.5">
                  {viewing.recommendations?.map((r, i) => (
                    <li key={i} className="text-sm text-emerald-900 flex gap-2"><Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-500" />{r}</li>
                  ))}
                </ul>
              </div>
              {viewing.chart_data?.length > 0 && (
                <div className="rounded-xl bg-muted/50 p-4">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Health Stage</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={viewing.chart_data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} strokeWidth={0}>
                        {viewing.chart_data.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend iconType="circle" iconSize={6} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HistoryPage;
