import { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";


const QUESTIONS = [
  "happy hour?",
  "dinner tonight?",
  "brunch this weekend?",
  "date night?",
  "lunch tomorrow?",
  "late night bites?",
  "drinks after work?",
  "sunday roast?",
];

export default function HomeScreen() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [settled, setSettled] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Detect system reduce motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion
    );
    return () => sub.remove();
  }, []);

  // Fade out and settle after 60s
  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => setSettled(true));
    }, 60000);
    return () => clearTimeout(timeout);
  }, [fadeAnim]);

  const cycleQuestion = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -12,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setQuestionIndex((i) => (i + 1) % QUESTIONS.length);
      slideAnim.setValue(14);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  // Cycle question on interval
  useEffect(() => {
    if (reduceMotion || settled) return;
    const interval = setInterval(cycleQuestion, 3000);
    return () => clearInterval(interval);
  }, [reduceMotion, settled, cycleQuestion]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <View style={styles.headerBlock}>
          {reduceMotion || settled ? (
            <Text style={styles.question}>where to?</Text>
          ) : (
            <>
              <Text style={styles.label}>where are we going for</Text>
              <Animated.Text
                style={[
                  styles.question,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                {QUESTIONS[questionIndex]}
              </Animated.Text>
            </>
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder="search places, restaurants…"
          placeholderTextColor="#b0a898"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <Text style={styles.footer}>commons</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E8",
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    width: "100%",
  },
  headerBlock: {
    alignItems: "center",
    marginBottom: 36,
  },
  label: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 15,
    color: "#8a7f73",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  question: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 36,
    fontWeight: "400",
    color: "#2C2620",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  input: {
    width: "100%",
    maxWidth: 340,
    borderBottomWidth: 1.5,
    borderBottomColor: "#C4B8A8",
    paddingVertical: 12,
    paddingHorizontal: 4,
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#2C2620",
    textAlign: "center",
  },
  footer: {
    paddingBottom: 36,
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: "#b0a898",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
});

