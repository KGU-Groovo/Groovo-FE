import { View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

export default function Header() {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.right}>
        <View style={styles.bellWrapper}>
          <Ionicons name="notifications-outline" size={22} color="#ccc" />
          <View style={styles.badge} />
        </View>
        <View style={styles.avatar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  logo: {
    height: 45,
    width: 90,
    
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bellWrapper: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 9,
    height: 9,
    backgroundColor: Colors.badge,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#3a3a3a",
    borderWidth: 2,
    borderColor: "#444",
  },
});
