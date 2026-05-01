// app/index.tsx
import { supabase } from "@/lib/supabase";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [session, setSession] = useState(undefined);
  const [onboarded, setOnboarded] = useState(undefined);

  const fetchOnboardingStatus = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", userId)
      .maybeSingle();
    setOnboarded(data?.onboarding_complete ?? false);
  };

  useEffect(() => {
    // 1. Hydrate immediately from cached session (handles returning users, no flicker)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
      if (session?.user) {
        fetchOnboardingStatus(session.user.id);
      } else {
        setOnboarded(null);
      }
    });

    // 2. React to all future auth changes (sign in, sign out, token refresh, callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session ?? null);
        if (session?.user) {
          await fetchOnboardingStatus(session.user.id);
        } else {
          setOnboarded(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Still resolving
  if (session === undefined || (session && onboarded === undefined)) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F0E8", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#8a7f73" />
      </View>
    );
  }

  if (!session) return <Redirect href="/auth" />;
  if (!onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}