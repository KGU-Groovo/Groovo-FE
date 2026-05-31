import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { Colors } from "@/constants/colors";

interface NoteRatingProps {
  count: number;
  max?: number;
}

export default function NoteRating({ count, max = 5 }: NoteRatingProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: max }).map((_, i) => {
        const active = i < count;
        const color = active ? Colors.ratingActive : Colors.ratingInactive;
        return (
          <Svg
  key={i}
  width={13}
  height={13}
  viewBox="0 0 24 24"
  stroke={color}
  strokeWidth={2}
>
  <Path d="M9 18V5l12-2v13" fill="none" />
  <Circle cx={6} cy={18} r={3} fill="none" />
  <Circle cx={18} cy={16} r={3} fill="none" />
</Svg>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 2,
    marginTop: 5,
  },
});
