import { supabase } from "@/lib/supabase";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileTab() {
  const handleSignOut = async () => {
    console.log("sign out tapped");
    const { error } = await supabase.auth.signOut();
    console.log("sign out result:", error ?? "success");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>profile</Text>
      <TouchableOpacity onPress={handleSignOut}>
        <Text style={styles.signOut}>sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F0E8", alignItems: "center", justifyContent: "center" },
  title: { fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", fontSize: 22, color: "#2C2620", marginBottom: 24 },
  signOut: { fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", fontSize: 13, color: "#8a7f73", textDecorationLine: "underline" },
});