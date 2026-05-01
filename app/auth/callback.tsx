import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AuthCallback() {
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const code = params.code as string;
      const token = params.access_token as string;

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      } else if (token) {
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: params.refresh_token as string,
        });
      }

      router.replace("/");
    };

    handleCallback();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F0E8", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator color="#8a7f73" />
    </View>
  );
}