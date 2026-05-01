import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SectionItem = { type: "section"; title: string };
type SpotItem = { type: "spot"; id: string; name: string; category: string; distance: string };
type ListItem = SectionItem | SpotItem;

// Placeholder until backend exists
const CATEGORY_FILTERS = ["all", "restaurants", "bars", "parks", "museums"];

const MOCK_NEARBY = [
  { id: "1", name: "Cafe Altro Paradiso", category: "restaurants", distance: "0.2 mi" },
  { id: "2", name: "Olmsted", category: "restaurants", distance: "0.4 mi" },
  { id: "3", name: "Negroni Bar", category: "bars", distance: "0.3 mi" },
  { id: "4", name: "Prospect Park", category: "parks", distance: "0.8 mi" },
  { id: "5", name: "Brooklyn Museum", category: "museums", distance: "1.1 mi" },
];

const MOCK_SAVED = [
  { id: "s1", name: "Via Carota", category: "restaurants", distance: "1.4 mi" },
  { id: "s2", name: "Attaboy", category: "bars", distance: "0.9 mi" },
];

export default function ExploreTab() {
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | requesting | granted | denied
  const [activeFilter, setActiveFilter] = useState("all");
  const [manualSearch, setManualSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (locationStatus === "granted" || locationStatus === "denied") {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [locationStatus, fadeAnim]);

  const requestLocation = async () => {
    setLocationStatus("requesting");

    if (Platform.OS === "web") {
      if (!navigator.geolocation) {
        setLocationStatus("denied");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log({ latitude, longitude });
          setLocationStatus("granted");
        },
        () => setLocationStatus("denied")
      );
      return;
    }
  };

  const filteredNearby =
    activeFilter === "all"
      ? MOCK_NEARBY
      : MOCK_NEARBY.filter((s) => s.category === activeFilter);

  const filteredSaved =
    activeFilter === "all"
      ? MOCK_SAVED
      : MOCK_SAVED.filter((s) => s.category === activeFilter);

  // ── Loading state ──
  if (locationStatus === "idle" || locationStatus === "requesting") {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#8a7f73" />
        <Text style={styles.loadingText}>finding your location…</Text>
      </View>
    );
  }

  if (locationStatus === "denied" && !submittedSearch) {
    return (
      <View style={styles.centered}>
        <Text style={styles.deniedTitle}>location access off</Text>
        <Text style={styles.deniedSub}>enter a city or zip to explore</Text>
        <TextInput
          style={styles.manualInput}
          placeholder="new york, ny or 10014"
          placeholderTextColor="#b0a898"
          value={manualSearch}
          onChangeText={setManualSearch}
          returnKeyType="search"
          onSubmitEditing={() => setSubmittedSearch(manualSearch)}
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => setSubmittedSearch(manualSearch)}
        >
          <Text style={styles.searchBtnText}>search</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={requestLocation}>
          <Text style={styles.retryText}>or enable location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Location context header */}
      <Text style={styles.contextLabel}>
        {submittedSearch ? `exploring ${submittedSearch}` : "exploring near you"}
      </Text>

      <FlatList
        horizontal
        data={CATEGORY_FILTERS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === item && styles.filterChipActive]}
            onPress={() => setActiveFilter(item)}
          >
            <Text
              style={[styles.filterLabel, activeFilter === item && styles.filterLabelActive]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    
      <FlatList
        data={[
          { type: "section", title: "saved nearby" } as SectionItem,
          ...filteredSaved.map((s): SpotItem => ({ type: "spot", ...s })),
          { type: "section", title: "nearby" } as SectionItem,
          ...filteredNearby.map((s): SpotItem => ({ type: "spot", ...s })),
        ] as ListItem[]}
        keyExtractor={(item, i) => (item.type === "spot" ? item.id : `section-${i}`)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          if (item.type === "section") {
            return <Text style={styles.sectionHeader}>{item.title}</Text>;
          }
          return (
            <View style={styles.spotRow}>
              <View>
                <Text style={styles.spotName}>{item.name}</Text>
                <Text style={styles.spotMeta}>{item.category} · {item.distance}</Text>
              </View>
            </View>
          );
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E8",
  },
  centered: {
    flex: 1,
    backgroundColor: "#F5F0E8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 12,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: "#8a7f73",
  },
  deniedTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 22,
    color: "#2C2620",
    marginBottom: 6,
  },
  deniedSub: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: "#8a7f73",
    marginBottom: 24,
  },
  manualInput: {
    width: "100%",
    borderBottomWidth: 1.5,
    borderBottomColor: "#C4B8A8",
    paddingVertical: 10,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 16,
    color: "#2C2620",
    textAlign: "center",
    marginBottom: 16,
  },
  searchBtn: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: "#2C2620",
    marginBottom: 16,
  },
  searchBtnText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: "#2C2620",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  retryText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 12,
    color: "#8a7f73",
    textDecorationLine: "underline",
  },
  contextLabel: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 13,
    color: "#8a7f73",
    letterSpacing: 0.3,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#C4B8A8",
  },
  filterChipActive: {
    backgroundColor: "#2C2620",
    borderColor: "#2C2620",
  },
  filterLabel: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 12,
    color: "#8a7f73",
    textTransform: "lowercase",
  },
  filterLabelActive: {
    color: "#F5F0E8",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 11,
    color: "#b0a898",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 20,
    marginBottom: 10,
  },
  spotRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE8DF",
  },
  spotName: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 16,
    color: "#2C2620",
    marginBottom: 2,
  },
  spotMeta: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 12,
    color: "#8a7f73",
  },
});