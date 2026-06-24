import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Subscription {
  tier: string;
  status: string;
  current_period_end: string | null;
  currency: string | null;
  amount_kobo: number | null;
  cancel_at_period_end: boolean | null;
}

export default function Billing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const loadSubscription = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("subscriptions")
      .select("tier, status, current_period_end, currency, amount_kobo, cancel_at_period_end")
      .eq("user_id", user.id)
      .maybeSingle();
    setSub(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSubscription();
  }, [user]);

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (reference && user && !verifying) {
      setVerifying(true);
      supabase.functions
        .invoke("paystack-verify", { body: { reference } })
        .then(({ data, error }) => {
          if (error) throw error;
          if (data?.success) {
            toast.success("Payment confirmed — welcome to your upgraded plan!");
            loadSubscription();
          } else {
            toast.error("Payment could not be verified");
          }
        })
        .catch((e) => toast.error(e?.message ?? "Verification failed"))
        .finally(() => {
          setVerifying(false);
          searchParams.delete("reference");
          searchParams.delete("trxref");
          searchParams.delete("verify");
          setSearchParams(searchParams, { replace: true });
        });
    }
  }, [searchParams, user]);

  const tier = sub?.tier ?? "free";
  const periodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString()
    : null;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">Manage your Aurora subscription</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current plan</CardTitle>
              <Badge variant={tier === "free" ? "secondary" : "default"} className="capitalize">
                {tier}
              </Badge>
            </div>
            <CardDescription>
              {sub?.status === "active" && periodEnd
                ? `Renews on ${periodEnd}`
                : "No active paid subscription"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading || verifying ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {verifying ? "Verifying your payment…" : "Loading…"}
              </div>
            ) : (
              <>
                {sub?.status === "active" && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Subscription is active
                  </div>
                )}
                <div className="flex gap-2">
                  <Button onClick={() => navigate("/pricing")}>
                    {tier === "free" ? "View plans" : "Change plan"}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/">Back to app</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          Payments are processed securely by Paystack. For refunds or billing issues, contact support.
        </p>
      </div>
    </div>
  );
}
