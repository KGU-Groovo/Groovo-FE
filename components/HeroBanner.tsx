import { View, StyleSheet } from "react-native";
import Svg, { Rect, Line, Circle, Ellipse, G, Defs, LinearGradient, Stop } from "react-native-svg";

const dancers = [
  { x: 60, armL: [-18, 35], armR: [12, 10], legL: [-14, 65], legR: [8, 65] },
  { x: 145, armL: [-20, 28], armR: [16, 25], legL: [-10, 62], legR: [14, 60] },
  { x: 230, armL: [-16, 12], armR: [20, 30], legL: [-12, 65], legR: [10, 65] },
  { x: 330, armL: [-18, 10], armR: [14, 28], legL: [-8, 63], legR: [12, 62] },
];

export default function HeroBanner() {
  return (
    <View style={styles.container}>
      {/* <Svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#2e2e2e" />
            <Stop offset="100%" stopColor="#1a1a1a" />
          </LinearGradient>
        </Defs>
        <Rect width={400} height={200} fill="url(#bg)" />
        {[80, 160, 240, 320].map((x) => (
          <Line key={x} x1={x} y1={0} x2={x} y2={165} stroke="#383838" strokeWidth={1} />
        ))}
        <Rect y={165} width={400} height={35} fill="#2a2a2a" />
        {dancers.map((d, i) => (
          <G key={i} translate={`${d.x},40`} fill="#1a1a1a" stroke="#1a1a1a">
            <Circle cx={0} cy={0} r={8} />
            <Rect x={-6} y={10} width={12} height={28} rx={3} />
            <Line x1={-6} y1={18} x2={d.armL[0]} y2={d.armL[1]} strokeWidth={4} />
            <Line x1={6} y1={18} x2={d.armR[0]} y2={d.armR[1]} strokeWidth={4} />
            <Line x1={-4} y1={38} x2={d.legL[0]} y2={d.legL[1]} strokeWidth={5} />
            <Line x1={4} y1={38} x2={d.legR[0]} y2={d.legR[1]} strokeWidth={5} />
            <Ellipse cx={0} cy={127} rx={16} ry={4} fill="#000" opacity={0.25} stroke="none" />
          </G>
        ))}
      </Svg> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 200,
  },
});
