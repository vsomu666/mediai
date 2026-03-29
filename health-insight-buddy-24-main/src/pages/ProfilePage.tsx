import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { LogOut, Pencil, Loader2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    setName(profile?.full_name || "");
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("analyses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setReportCount(count ?? 0));
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ full_name: name }).eq("user_id", user.id);
    await refreshProfile();
    setEditing(false);
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const initials = (profile?.full_name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <div className="rounded-2xl bg-card p-6 md:p-8 card-shadow animate-fade-up text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-primary-foreground">
              {initials}
            </div>

            {editing ? (
              <div className="flex items-center gap-2 justify-center">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground active:scale-[0.97]"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </button>
                <button onClick={() => setEditing(false)} className="text-sm text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{profile?.full_name || "User"}</h2>
                <button onClick={() => setEditing(true)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}

            <p className="mt-1 text-sm text-muted-foreground">{profile?.email || user?.email}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-muted/50 p-4">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-foreground tabular-nums">{reportCount}</span>
              <span className="text-sm text-muted-foreground">Total Reports</span>
            </div>

            <button
              onClick={handleLogout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors active:scale-[0.97]"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
