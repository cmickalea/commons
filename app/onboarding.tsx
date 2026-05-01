import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const VIBES = [
  "coffee spots",
  "date night",
  "live music",
  "parks & walks",
  "art & museums",
  "late night food",
  "rooftop drinks",
  "quiet places",
];

export default function Onboarding() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else if (selected.length < 5) {
      setSelected([...selected, item]);
    }
  };

  const handleContinue = async () => {
    if (selected.length < 3 || loading) return;
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found.");

      const { error: prefError } = await supabase
        .from("preferences")
        .upsert({ user_id: user.id, vibes: selected });
      if (prefError) throw prefError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_complete: true })
        .eq("id", user.id);
      if (profileError) throw profileError;

      // Index gate re-evaluates and sends them to /(tabs)
      router.replace("/");
    }  catch (e: any) {
  console.log("ONBOARDING ERROR:", JSON.stringify(e, null, 2));
  setError(e?.message || JSON.stringify(e) || "Something went wrong.");
  setLoading(false);
}
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.headerBlock}>
          <Text style={styles.label}>get started</Text>
          <Text style={styles.question}>what feels like you?</Text>
          <Text style={styles.context}>
            pick a few — this shapes what you'll see
          </Text>
        </View>

        <View style={styles.chipList}>
          {VIBES.map((item) => {
            const isSelected = selected.includes(item);
            return (
              <TouchableOpacity
                key={item}
                onPress={() => toggle(item)}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          onPress={handleContinue}
          disabled={selected.length < 3 || loading}
          style={{ marginTop: 28 }}
        >
          {loading ? (
            <ActivityIndicator color="#8a7f73" />
          ) : (
            <Text style={[styles.footer, { opacity: selected.length >= 3 ? 1 : 0.4 }]}>
              continue ({selected.length}/5)
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E8",
  },

  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },

  headerBlock: {
    marginBottom: 32,
  },

  label: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: "#b0a898",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },

  question: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 32,
    fontWeight: "400",
    color: "#2C2620",
    letterSpacing: -0.5,
  },

  context: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: "#8a7f73",
    marginTop: 8,
    lineHeight: 18,
  },

  chipList: {
    marginTop: 8,
  },

  chip: {
    borderWidth: 1,
    borderColor: "#C4B8A8",
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    alignSelf: "flex-start",
  },

  chipSelected: {
    backgroundColor: "#2C2620",
    borderColor: "#2C2620",
  },

  chipText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 14,
    color: "#8a7f73",
  },

  chipTextSelected: {
    color: "#F5F0E8",
  },

  footer: {
    marginTop: 24,
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: "#b0a898",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  errorText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: "#8a7f73",
    marginTop: 16,
    },
});