import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Activity, AlertTriangle, ShieldCheck, Plus, Loader2 } from "lucide-react";

interface AnalysisRow {
  id: string;
  created_at: string;
  disease_name: string | null;
  risk_level: string | null;
  name: string | null;
}

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, high: 0, low: 0 });
  const [recent, setRecent] = useState<AnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data, count } = await supabase
        .from("analyses")
        .select("id, created_at, disease_name, risk_level, name", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) {
        setRecent(data);
        const total = count ?? data.length;
        const high = data.filter((d) => d.risk_level === "High").length;
        const low = data.filter((d) => d.risk_level === "Low").length;
        // For accurate counts, query all
        const { data: all } = await supabase
          .from("analyses")
          .select("risk_level")
          .eq("user_id", user.id);
        if (all) {
          setStats({
            total: all.length,
            high: all.filter((a) => a.risk_level === "High").length,
            low: all.filter((a) => a.risk_level === "Low").length,
          });
        } else {
          setStats({ total, high, low });
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const riskColor: Record<string, string> = {
    Low: "bg-emerald-100 text-emerald-700",
    Medium: "bg-amber-100 text-amber-700",
    High: "bg-red-100 text-red-700",
  };

  const statCards = [
    { label: "Total Analyses", value: stats.total, icon: Activity, color: "text-primary bg-primary/10" },
    { label: "High Risk", value: stats.high, icon: AlertTriangle, color: "text-red-600 bg-red-100" },
    { label: "Low Risk", value: stats.low, icon: ShieldCheck, color: "text-emerald-600 bg-emerald-100" },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-up">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {profile?.full_name || "there"}
              </h1>
              <p className="text-sm text-muted-foreground">Here's your health overview.</p>
            </div>
            <button
              onClick={() => navigate("/analyze")}
              className="flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" /> Start New Analysis
            </button>
          </div>

          {loading ? (
            <div className="mt-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {statCards.map((s, i) => (
                  <div
                    key={s.label}
                    className="rounded-2xl bg-card p-5 card-shadow animate-fade-up"
                    style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
                  >
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 animate-fade-up animate-fade-up-delay-3">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Analyses</h2>
                {recent.length === 0 ? (
                  <div className="rounded-2xl bg-card p-8 card-shadow text-center">
                    <p className="text-muted-foreground">No analyses yet. Start your first one!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recent.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => navigate("/history")}
                        className="flex flex-wrap items-center gap-4 rounded-xl bg-card p-4 card-shadow cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{r.disease_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${riskColor[r.risk_level || ""] || ""}`}>
                          {r.risk_level}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
