import { View, Text } from "react-native";
import { Colors } from "@/constants/theme";

interface PremiumCardProps {
  children?: React.ReactNode;
  style?: any;
}

export function PremiumCard({ children, style }: PremiumCardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.dark.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: `rgba(47, 209, 127, 0.15)`,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface PremiumButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  style?: any;
}

export function PremiumButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}: PremiumButtonProps) {
  const baseStyle = {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  };

  const variantStyles = {
    primary: {
      backgroundColor: Colors.dark.accentPrimary,
    },
    secondary: {
      backgroundColor: Colors.dark.accentPrimary,
    },
    outline: {
      borderWidth: 1.5,
      borderColor: Colors.dark.accentPrimary,
      backgroundColor: "transparent",
    },
  };

  const textColor =
    variant === "outline" ? Colors.dark.accentPrimary : Colors.dark.bg;

  return (
    <View
      style={[
        baseStyle,
        variantStyles[variant],
        disabled && { opacity: 0.5 },
        style,
      ]}
      onTouchEnd={!disabled ? onPress : undefined}
    >
      <Text
        style={{
          color: textColor,
          fontWeight: "700",
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

interface BadgeProps {
  icon: string;
  label: string;
  description?: string;
}

export function Badge({ icon, label, description }: BadgeProps) {
  return (
    <View
      style={{
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: `rgba(47, 209, 127, 0.1)`,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: `rgba(47, 209, 127, 0.3)`,
      }}
    >
      <Text style={{ fontSize: 20, marginBottom: 4 }}>{icon}</Text>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: Colors.dark.accentPrimary,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: 10,
            color: Colors.dark.textSecondary,
            marginTop: 2,
            textAlign: "center",
          }}
        >
          {description}
        </Text>
      )}
    </View>
  );
}

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: "small" | "medium" | "large";
}

export function RatingDisplay({
  rating = 0,
  maxRating = 5,
  size = "medium",
}: RatingDisplayProps) {
  const sizes = {
    small: { icon: 12, text: 12 },
    medium: { icon: 16, text: 14 },
    large: { icon: 24, text: 18 },
  };

  const safeRating = rating ?? 0;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Text style={{ fontSize: sizes[size].icon }}>⭐</Text>
      <Text
        style={{
          fontSize: sizes[size].text,
          fontWeight: "700",
          color: Colors.dark.accentPrimary,
        }}
      >
        {safeRating.toFixed(1)}
      </Text>
      <Text
        style={{
          fontSize: sizes[size].text - 2,
          color: Colors.dark.textSecondary,
        }}
      >
        / {maxRating}
      </Text>
    </View>
  );
}

interface ScoreBarProps {
  score: number;
  maxScore?: number;
  label?: string;
}

export function ScoreBar({ score, maxScore = 10, label }: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;
  const color =
    score >= 8 ? Colors.dark.accentPrimary : Colors.dark.accentSecondary;

  return (
    <View>
      {label && (
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: Colors.dark.textSecondary,
            marginBottom: 4,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          height: 8,
          backgroundColor: Colors.dark.cardAlt,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${percentage}%`,
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      </View>
      <Text
        style={{
          fontSize: 12,
          color: color,
          fontWeight: "600",
          marginTop: 4,
        }}
      >
        {(score ?? 0).toFixed(1)} / {maxScore}
      </Text>
    </View>
  );
}

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: selected ? Colors.dark.accentPrimary : Colors.dark.textTertiary,
        backgroundColor: selected ? `rgba(47, 209, 127, 0.1)` : "transparent",
      }}
      onTouchEnd={onPress}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: selected ? Colors.dark.accentPrimary : Colors.dark.textSecondary,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

interface SkeletonProps {
  width?: string | number;
  height?: number;
  borderRadius?: number;
}

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 8,
}: SkeletonProps) {
  return (
    <View
      style={{
        width: typeof width === "string" ? width : width,
        height,
        backgroundColor: Colors.dark.cardAlt,
        borderRadius,
        opacity: 0.5,
      } as any}
    />
  );
}
