import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { BlurView } from "expo-blur";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "info" | "confirm";
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const { width } = Dimensions.get("window");

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = "info",
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
}) => {
  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={32} color="#10b981" />;
      case "error":
        return <AlertCircle size={32} color="#ef4444" />;
      case "confirm":
        return <Info size={32} color="#6366f1" />;
      default:
        return <Info size={32} color="#3b82f6" />;
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case "success":
        return "rgba(16, 185, 129, 0.1)";
      case "error":
        return "rgba(239, 68, 68, 0.1)";
      case "confirm":
        return "rgba(99, 102, 241, 0.1)";
      default:
        return "rgba(59, 130, 246, 0.1)";
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <BlurView
            intensity={20}
            style={StyleSheet.absoluteFill}
            tint="dark"
          />
        </TouchableWithoutFeedback>

        <View style={styles.alertContainer}>
          <LinearGradient
            colors={["#ffffff", "#f8fafc"]}
            style={styles.alertBackground}
          />

          <View
            style={[styles.iconWrapper, { backgroundColor: getBadgeColor() }]}
          >
            {getIcon()}
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {type === "confirm" && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                type === "confirm"
                  ? styles.confirmButton
                  : styles.primaryButton,
                type === "error" && styles.errorButton,
              ]}
              onPress={onConfirm || onClose}
            >
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  alertContainer: {
    width: width - 60,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  alertBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
  },
  primaryButton: {
    backgroundColor: "#0f172a",
  },
  confirmButton: {
    backgroundColor: "#4f46e5",
  },
  errorButton: {
    backgroundColor: "#ef4444",
  },
  cancelText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
