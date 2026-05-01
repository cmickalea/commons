import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Keyboard,
    Platform,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from "react-native";

// ── Constants ──────────────────────────────────────────────
// Abstracted per best practice — one place to update when model versions change
const AI_MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1000;
const API_URL = "https://api.anthropic.com/v1/messages";

const LOADING_MESSAGES = [
  "scanning the neighborhood...",
  "checking happy hour windows...",
  "surfacing the best spots...",
  "almost there...",
];

const SUGGESTED_PROMPTS = [
  "best happy hour deals near me",
  "good bar to watch the game sunday",
  "something different for date night",
  "late night bites after 11pm",
  "rooftop drinks tonight",
];

// ── Types ───────────────────────────────────────────────────
type Status = "idle" | "loading" | "success" | "error";
type Recommendation = {
  name: string;
  category: string;
  reason: string;
  distance: string;
  priceRange: string;
};

// ── Component ───────────────────────────────────────────────
export default function AITab({ coords }: { coords?: { latitude: number; longitude: number } }) {
  // Single status enum — no impossible boolean states
  const [status, setStatus] = useState<Status>("idle");
  const [prompt, setPrompt] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingIndex, setLoadingIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Cycle loading messages while request is in flight
  useEffect(() => {
    if (status !== "loading") return;
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setLoadingIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [status]);

  const getRecommendations = async (submittedPrompt: string) => {
    Keyboard.dismiss();
    setStatus("loading");
    setRecommendations([]);

    // Context injection — this is what makes responses feel local and specific
    const now = new Date();
    const systemPrompt = `You are a local recommendations assistant for Commons, 
an app that helps people make plans with friends.
${coords ? `The user's location is ${coords.latitude}, ${coords.longitude}.` : "Location unavailable."}
Current time: ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
Today is ${now.toLocaleDateString([], { weekday: "long" })}.

Return ONLY a valid JSON array. No markdown, no explanation, no code fences.
Each object must have exactly these fields:
- name: string (venue name)
- category: string (one of: restaurant, bar, park, museum, event)
- reason: string (one specific sentence explaining why it fits this request)
- distance: string (estimated e.g. "0.4 mi")
- priceRange: string (one of: $, $$, $$$)

Limit to 5 results. Be specific. Avoid generic answers.`;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: MAX_TOKENS,
          system: systemPrompt,
          messages: [{ role: "user", content: submittedPrompt }],
        }),
      });

      // Handle API-level errors separately from network errors
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      // Parse failure handled independently — models occasionally return malformed JSON
      try {
        const parsed = JSON.parse(data.content[0].text);
        setRecommendations(parsed);
        setStatus("success");
      } catch {
        setErrorMsg("Couldn't read the recommendations. Try rephrasing.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Connection issue. Check your internet and try again.");
      setStatus("error");
    }
  };

  const handleSubmit = () => {
    if (prompt.trim()) getRecommendations(prompt.trim());
  };

  const handleSuggestion = (s: string) => {
    setPrompt(s);
    getRecommendations(s);
  };

  const reset = () => {
    setStatus("idle");
    setPrompt("");
    setRecommendations([]);
    setErrorMsg("");
  };

  return (
    <View style={styles.container}>
      {/* Input */}
      <View style={styles.inputBlock}>
        <TextInput
          style={styles.input}
          placeholder="what are you looking for?"
          placeholderTextColor="#b0a898"
          value={prompt}
          onChangeText={setPrompt}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          editable={status !== "loading"}
        />
        {prompt.length > 0 && status !== "loading" && (
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Idle — show suggested prompts */}
      {status === "idle" && (
        <View style={styles.suggestions}>
          <Text style={styles.suggestionsLabel}>try asking</Text>
          {SUGGESTED_PROMPTS.map((s) => (
            <TouchableOpacity key={s} style={styles.chip} onPress={() => handleSuggestion(s)}>
              <Text style={styles.chipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Loading */}
      {status === "loading" && (
        <View style={styles.centered}>
          <ActivityIndicator color="#8a7f73" style={{ marginBottom: 16 }} />
          <Animated.Text style={[styles.loadingMsg, { opacity: fadeAnim }]}>
            {LOADING_MESSAGES[loadingIndex]}
          </Animated.Text>
        </View>
      )}

      {/* Error */}
      {status === "error" && (
        <View style={styles.centered}>
          <Text style={styles.errorMsg}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={reset}>
            <Text style={styles.retryText}>try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
      {status === "success" && (
        <FlatList
          data={recommendations}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.results}
          ListHeaderComponent={
            <TouchableOpacity onPress={reset} style={styles.newSearchBtn}>
              <Text style={styles.newSearchText}>← new search</Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardPrice}>{item.priceRange}</Text>
              </View>
              <Text style={styles.cardMeta}>
                {item.category} · {item.distance}
              </Text>
              <Text style={styles.cardReason}>{item.reason}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F0E8" },
  inputBlock: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#C4B8A8",
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 16,
    color: "#2C2620",
  },
  submitBtn: { paddingLeft: 12 },
  submitBtnText: { fontSize: 22, color: "#2C2620" },
  suggestions: { paddingHorizontal: 24 },
  suggestionsLabel: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 11,
    color: "#b0a898",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#C4B8A8",
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  chipText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: "#8a7f73",
  },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  loadingMsg: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 14,
    color: "#8a7f73",
    textAlign: "center",
  },
  errorMsg: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 14,
    color: "#2C2620",
    textAlign: "center",
    marginBottom: 20,
  },
  retryBtn: { borderBottomWidth: 1, borderBottomColor: "#C4B8A8" },
  retryText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: "#8a7f73",
    paddingBottom: 2,
  },
  results: { paddingHorizontal: 24, paddingBottom: 40 },
  newSearchBtn: { marginBottom: 20 },
  newSearchText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 12,
    color: "#8a7f73",
  },
  card: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE8DF",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  cardName: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 17,
    color: "#2C2620",
    flex: 1,
  },
  cardPrice: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: "#8a7f73",
    marginLeft: 8,
  },
  cardMeta: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 12,
    color: "#b0a898",
    marginBottom: 6,
  },
  cardReason: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: "#5a5048",
    lineHeight: 19,
  },
});