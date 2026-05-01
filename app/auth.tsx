import { supabase } from "@/lib/supabase";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from "react-native";


type Mode = "signin" | "signup" | "magic";

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const redirectTo = "commons://auth/callback";

  const reset = () => {
    setStatus("idle");
    setMessage("");
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || (!password.trim() && mode !== "magic")) {
      setMessage("Please enter your email and password.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        setMessage(error.message);
        setStatus("error");
      } else {
        setMessage("Check your email to confirm your account.");
        setStatus("success");
      }
      return;
    }

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setStatus("error");
      } else {
        setStatus("success");
      }
    }
  };


  const handleMagicLink = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setMessage(error.message);
      setStatus("error");
    } else {
      setMessage("Magic link sent — check your email.");
      setStatus("success");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.wordmark}>commons</Text>
        <Text style={styles.tagline}>make plans with people you like</Text>

        <View style={styles.modeRow}>
          {(["signin", "signup", "magic"] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => { setMode(m); reset(); }}
              style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
            >
              <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                {m === "signin" ? "sign in" : m === "signup" ? "sign up" : "magic link"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="email"
          placeholderTextColor="#b0a898"
          value={email}
          onChangeText={(v) => { setEmail(v); reset(); }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {mode !== "magic" && (
          <TextInput
            style={styles.input}
            placeholder="password"
            placeholderTextColor="#b0a898"
            value={password}
            onChangeText={(v) => { setPassword(v); reset(); }}
            secureTextEntry
          />
        )}

        {message ? (
          <Text style={[
            styles.message,
            status === "error" ? styles.messageError : styles.messageSuccess
          ]}>
            {message}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={mode === "magic" ? handleMagicLink : handleEmailAuth}
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <ActivityIndicator color="#F5F0E8" />
          ) : (
            <Text style={styles.submitBtnText}>
              {mode === "magic" ? "send magic link" : mode === "signin" ? "sign in" : "create account"}
            </Text>
          )}
        </TouchableOpacity>

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
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  wordmark: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 36,
    color: "#2C2620",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: "#8a7f73",
    marginBottom: 40,
  },
  modeRow: {
    flexDirection: "row",
    marginBottom: 28,
    gap: 8,
  },
  modeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#C4B8A8",
  },
  modeBtnActive: {
    backgroundColor: "#2C2620",
    borderColor: "#2C2620",
  },
  modeBtnText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 12,
    color: "#8a7f73",
  },
  modeBtnTextActive: {
    color: "#F5F0E8",
  },
  input: {
    width: "100%",
    borderBottomWidth: 1.5,
    borderBottomColor: "#C4B8A8",
    paddingVertical: 12,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 16,
    color: "#2C2620",
    marginBottom: 16,
  },
  message: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  messageError: { color: "#8a7f73" },
  messageSuccess: { color: "#2C2620" },
  submitBtn: {
    width: "100%",
    backgroundColor: "#2C2620",
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 14,
    color: "#F5F0E8",
    letterSpacing: 1,
    textTransform: "uppercase",
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