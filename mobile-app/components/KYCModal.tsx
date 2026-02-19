import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { GlassView } from "./GlassView";
import {
  X,
  Upload,
  Camera,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";

interface KYCModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  status?: string | null;
}

export default function KYCModal({
  visible,
  onClose,
  onSuccess,
  userId,
  status,
}: KYCModalProps) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<{
    pan: any;
    adhaar: any;
    bank: any;
    selfie: string | null;
  }>({
    pan: null,
    adhaar: null,
    bank: null,
    selfie: null,
  });

  const pickDocument = async (type: "pan" | "adhaar" | "bank") => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setDocuments((prev) => ({ ...prev, [type]: result.assets[0] }));
    } catch (err) {
      console.error("Error picking document:", err);
    }
  };

  const takeSelfie = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission to access camera is required!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        cameraType: ImagePicker.CameraType.front, // Force front camera
      });

      if (!result.canceled) {
        setDocuments((prev) => ({ ...prev, selfie: result.assets[0].uri }));
      }
    } catch (err) {
      console.error("Error taking selfie:", err);
    }
  };

  const uploadFile = async (file: any, path: string) => {
    try {
      console.log(`Uploading file from ${file.uri} to ${path}`);

      const response = await fetch(file.uri);
      const arrayBuffer = await response.arrayBuffer();

      const { data, error } = await supabase.storage
        .from("kyc-documents")
        .upload(path, arrayBuffer, {
          upsert: true,
          contentType: file.mimeType || "image/jpeg",
        });

      if (error) {
        console.error("Supabase Storage Error:", error);
        throw error;
      }
      return data.path;
    } catch (e: any) {
      console.error("Upload failed detail:", e);
      throw new Error(`Upload failed for ${path}: ${e.message || e}`);
    }
  };

  const handleSubmit = async () => {
    if (
      !documents.pan ||
      !documents.adhaar ||
      !documents.bank ||
      !documents.selfie
    ) {
      Alert.alert(
        "Missing Information",
        "Please upload all documents and take a selfie.",
      );
      return;
    }

    setLoading(true);
    try {
      const timestamp = Date.now();
      const panPath = `${userId}/pan_${timestamp}.jpg`;
      const adhaarPath = `${userId}/adhaar_${timestamp}.jpg`;
      const bankPath = `${userId}/bank_${timestamp}.jpg`;
      const selfiePath = `${userId}/selfie_${timestamp}.jpg`;

      const [panRes, adhaarRes, bankRes, selfieRes] = await Promise.all([
        uploadFile(documents.pan, panPath),
        uploadFile(documents.adhaar, adhaarPath),
        uploadFile(documents.bank, bankPath),
        uploadFile({ uri: documents.selfie }, selfiePath),
      ]);

      const { data, error } = await supabase.functions.invoke("kyc-api", {
        body: {
          action: "submit-kyc",
          data: {
            user_id: userId,
            pan_url: panRes,
            adhaar_url: adhaarRes,
            bank_url: bankRes,
            selfie_url: selfieRes,
          },
        },
      });

      if (error) throw error;

      Alert.alert("Success", "KYC Submitted Successfully!");
      onSuccess();
      onClose();
    } catch (e: any) {
      Alert.alert("Error", `Submission failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const textColor = theme === "dark" ? "#fff" : "#0f172a";
  const subTextColor = theme === "dark" ? "#94a3b8" : "#64748b";
  const cardBg =
    theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)";
  const borderColor =
    theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const btnBg = theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

  const renderContent = () => {
    if (status === "verified") {
      return (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <CheckCircle size={80} color="#10b981" />
          <Text style={[styles.title, { color: textColor, marginTop: 20 }]}>
            KYC Verified
          </Text>
          <Text
            style={{ color: subTextColor, textAlign: "center", marginTop: 10 }}
          >
            Your account is fully verified. You can now withdraw funds.
          </Text>
        </View>
      );
    }

    if (status === "pending" || status === "submitted") {
      return (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <ActivityIndicator
            size="large"
            color="#3b82f6"
            style={{ marginBottom: 20 }}
          />
          <Text style={[styles.title, { color: textColor }]}>
            Verification In Progress
          </Text>
          <Text
            style={{
              color: subTextColor,
              textAlign: "center",
              marginTop: 10,
              paddingHorizontal: 20,
            }}
          >
            We have received your documents. Verification typically takes 24-48
            hours.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.content}>
        {status === "rejected" && (
          <View
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              padding: 10,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#ef4444", textAlign: "center" }}>
              Your previous KYC was rejected. Please re-submit.
            </Text>
          </View>
        )}

        {step === 1 ? (
          <View style={styles.stepContainer}>
            <View style={[styles.uploadItem, { backgroundColor: cardBg }]}>
              <View>
                <Text style={[styles.label, { color: textColor }]}>
                  1. PAN Card
                </Text>
                <Text style={styles.subLabel}>Upload clear image or PDF</Text>
              </View>
              <TouchableOpacity
                onPress={() => pickDocument("pan")}
                style={styles.uploadBtn}
              >
                {documents.pan ? (
                  <CheckCircle size={24} color="#10b981" />
                ) : (
                  <Upload size={24} color="#3b82f6" />
                )}
              </TouchableOpacity>
            </View>
            {documents.pan && (
              <Text style={styles.fileName}>{documents.pan.name}</Text>
            )}

            <View style={[styles.uploadItem, { backgroundColor: cardBg }]}>
              <View>
                <Text style={[styles.label, { color: textColor }]}>
                  2. Aadhaar Card
                </Text>
                <Text style={styles.subLabel}>
                  Front & Back in one file if possible
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => pickDocument("adhaar")}
                style={styles.uploadBtn}
              >
                {documents.adhaar ? (
                  <CheckCircle size={24} color="#10b981" />
                ) : (
                  <Upload size={24} color="#3b82f6" />
                )}
              </TouchableOpacity>
            </View>
            {documents.adhaar && (
              <Text style={styles.fileName}>{documents.adhaar.name}</Text>
            )}

            <View style={[styles.uploadItem, { backgroundColor: cardBg }]}>
              <View>
                <Text style={[styles.label, { color: textColor }]}>
                  3. Bank Proof
                </Text>
                <Text style={styles.subLabel}>
                  Passbook or Cancelled Cheque
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => pickDocument("bank")}
                style={styles.uploadBtn}
              >
                {documents.bank ? (
                  <CheckCircle size={24} color="#10b981" />
                ) : (
                  <Upload size={24} color="#3b82f6" />
                )}
              </TouchableOpacity>
            </View>
            {documents.bank && (
              <Text style={styles.fileName}>{documents.bank.name}</Text>
            )}
          </View>
        ) : (
          <View style={styles.stepContainer}>
            <Text
              style={[styles.label, { color: textColor, marginBottom: 20 }]}
            >
              4. Take a Live Selfie
            </Text>

            <View style={styles.cameraContainer}>
              {documents.selfie ? (
                <Image
                  source={{ uri: documents.selfie }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <Camera size={48} color="#94a3b8" />
                  <Text style={{ color: "#94a3b8", marginTop: 10 }}>
                    No Photo Taken
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.captureBtn} onPress={takeSelfie}>
              <Camera size={20} color="#fff" />
              <Text style={styles.btnText}>
                {documents.selfie ? "Retake Photo" : "Open Camera"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <GlassView
          intensity={95}
          style={[
            styles.modalContainer,
            theme === "dark" && { backgroundColor: "rgba(15, 23, 42, 0.95)" },
          ]}
          tint={theme === "dark" ? "dark" : "light"}
        >
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <View>
              <Text style={[styles.title, { color: textColor }]}>
                {status === "pending" || status === "submitted"
                  ? "KYC Status"
                  : "Complete KYC"}
              </Text>
              {!status || status === "rejected" ? (
                <Text style={{ color: subTextColor }}>Step {step} of 2</Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: btnBg }]}
            >
              <X size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {renderContent()}

          {(!status || status === "rejected") && (
            <View style={[styles.footer, { borderTopColor: borderColor }]}>
              {step === 2 && (
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStep(1)}
                  disabled={loading}
                >
                  <Text style={{ color: textColor }}>Back</Text>
                </TouchableOpacity>
              )}

              {step === 1 ? (
                <TouchableOpacity
                  style={[
                    styles.nextBtn,
                    (!documents.pan || !documents.adhaar || !documents.bank) &&
                      styles.disabledBtn,
                  ]}
                  onPress={() => setStep(2)}
                  disabled={
                    !documents.pan || !documents.adhaar || !documents.bank
                  }
                >
                  <Text style={styles.btnText}>Next Step</Text>
                  <ChevronRight size={20} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.startBtn,
                    (!documents.selfie || loading) && styles.disabledBtn,
                  ]}
                  onPress={handleSubmit}
                  disabled={!documents.selfie || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>Submit Verification</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </GlassView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "90%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeBtn: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    gap: 15,
  },
  uploadItem: {
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subLabel: {
    fontSize: 12,
    color: "#94a3b8",
  },
  uploadBtn: {
    padding: 10,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
  },
  fileName: {
    fontSize: 12,
    color: "#16a34a",
    marginLeft: 10,
    marginBottom: 10,
  },
  cameraContainer: {
    height: 300,
    backgroundColor: "#000",
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  cameraPlaceholder: {
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  captureBtn: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    padding: 16,
  },
  nextBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: "auto",
  },
  startBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginLeft: 20,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
