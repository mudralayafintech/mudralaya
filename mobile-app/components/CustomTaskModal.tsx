import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  Alert
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  X,
  Upload,
  CheckCircle,
  Circle,
  Square,
  CheckSquare,
  ChevronDown
} from "lucide-react-native";
import { useTheme } from "@/lib/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassView } from "@/components/GlassView";

interface CustomTaskModalProps {
  task: any;
  visible: boolean;
  onClose: () => void;
  onSubmit: (responses: Record<string, any>, fileUploads: Record<string, any>) => Promise<void>;
}

export const CustomTaskModal = ({ task, visible, onClose, onSubmit }: CustomTaskModalProps) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [fileUploads, setFileUploads] = useState<Record<string, { uri: string, name: string, base64: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (visible) {
      setResponses({});
      setFileUploads({});
      setIsSubmitting(false);
    }
  }, [visible, task?.id]);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const subTextColor = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const inputBg = isDark ? "rgba(30,41,59,0.5)" : "#f8fafc";
  const activeColor = isDark ? "#3b82f6" : "#2563eb";

  let config: any = null;
  try {
    if (task?.steps) {
      config = JSON.parse(task.steps);
    }
  } catch (e) {
    console.error("Failed to parse custom task config", e);
  }

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleFilePick = async (questionId: string) => {
    try {
      const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permResult.granted) {
        Alert.alert("Permission Required", "Please allow access to your photos to upload a file.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
        allowsEditing: true,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const name = `upload_${Date.now()}.jpg`;
        setFileUploads(prev => ({
          ...prev,
          [questionId]: { uri: asset.uri, name, base64: asset.base64 || "" }
        }));
      }
    } catch (e) {
      console.error("Image pick error", e);
      Alert.alert("Error", "Could not select image.");
    }
  };

  const handleSubmit = async () => {
    if (!config?.questions) return;

    // Validate required questions
    for (const q of config.questions) {
      if (q.required) {
        if (q.type === 'File upload') {
          if (!fileUploads[q.id]) {
            Alert.alert("Required Field", `Please upload a file for: "${q.title}"`);
            return;
          }
        } else if (q.type === 'Checkboxes') {
          if (!responses[q.id] || responses[q.id].length === 0) {
            Alert.alert("Required Field", `Please select at least one option for: "${q.title}"`);
            return;
          }
        } else if (q.type === 'Multiple choice grid' || q.type === 'Checkbox grid') {
          const isFullyAnswered = q.gridRows?.every((row: string) => {
            if (q.type === 'Checkbox grid') return responses[q.id]?.[row]?.length > 0;
            return !!responses[q.id]?.[row];
          });
          if (!isFullyAnswered) {
            Alert.alert("Required Field", `Please answer all rows in: "${q.title}"`);
            return;
          }
        } else {
          if (responses[q.id] === undefined || responses[q.id] === null || responses[q.id] === "") {
            Alert.alert("Required Field", `Please fill out: "${q.title}"`);
            return;
          }
        }
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(responses, fileUploads);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to submit task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible || !config) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
        <View style={[styles.header, { borderBottomColor: borderColor, backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isSubmitting}>
            <X size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
            {config.title || "Custom Task"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {config.description ? (
            <Text style={[styles.description, { color: subTextColor }]}>{config.description}</Text>
          ) : null}

          {config.questions?.map((q: any) => (
            <View key={q.id} style={[styles.questionCard, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor }]}>
              <Text style={[styles.questionTitle, { color: textColor }]}>
                {q.title}
                {q.required && <Text style={{ color: '#ef4444' }}> *</Text>}
              </Text>

              {q.type === 'Short answer' && (
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  placeholder="Your answer"
                  placeholderTextColor={subTextColor}
                  value={responses[q.id] || ''}
                  onChangeText={(val) => handleResponseChange(q.id, val)}
                />
              )}

              {q.type === 'Paragraph' && (
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: inputBg, color: textColor, borderColor }]}
                  placeholder="Your answer"
                  placeholderTextColor={subTextColor}
                  value={responses[q.id] || ''}
                  onChangeText={(val) => handleResponseChange(q.id, val)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              )}

              {q.type === 'Multiple choice' && (
                <View style={styles.optionsList}>
                  {q.options?.map((opt: string, idx: number) => {
                    const isSelected = responses[q.id] === opt;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={styles.optionRow}
                        onPress={() => handleResponseChange(q.id, opt)}
                      >
                        {isSelected ? <CheckCircle size={20} color={activeColor} /> : <Circle size={20} color={subTextColor} />}
                        <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {q.type === 'Checkboxes' && (
                <View style={styles.optionsList}>
                  {q.options?.map((opt: string, idx: number) => {
                    const checkedArray = responses[q.id] || [];
                    const isSelected = checkedArray.includes(opt);
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={styles.optionRow}
                        onPress={() => {
                          if (isSelected) {
                            handleResponseChange(q.id, checkedArray.filter((v: string) => v !== opt));
                          } else {
                            handleResponseChange(q.id, [...checkedArray, opt]);
                          }
                        }}
                      >
                        {isSelected ? <CheckSquare size={20} color={activeColor} /> : <Square size={20} color={subTextColor} />}
                        <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {q.type === 'Dropdown' && (
                <View style={[styles.dropdownContainer, { backgroundColor: inputBg, borderColor }]}>
                  {/* On Mobile, standard Dropdown can be complex. We'll use a simple list since we don't have Picker. */}
                  {q.options?.map((opt: string, idx: number) => {
                    const isSelected = responses[q.id] === opt;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.dropdownItem, idx > 0 && { borderTopWidth: 1, borderTopColor: borderColor }]}
                        onPress={() => handleResponseChange(q.id, opt)}
                      >
                        <Text style={[styles.optionText, { color: isSelected ? activeColor : textColor, fontWeight: isSelected ? '600' : '400' }]}>{opt}</Text>
                        {isSelected && <CheckCircle size={16} color={activeColor} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {q.type === 'Linear scale' && (
                <View style={styles.linearScale}>
                  <View style={styles.scaleLabels}>
                    <Text style={{ color: subTextColor, fontSize: 12 }}>{q.scaleLowLabel}</Text>
                    <Text style={{ color: subTextColor, fontSize: 12 }}>{q.scaleHighLabel}</Text>
                  </View>
                  <View style={styles.scaleDots}>
                    {Array.from({ length: (q.scaleHigh || 5) - (q.scaleLow || 1) + 1 }).map((_, i) => {
                      const val = (q.scaleLow || 1) + i;
                      const isSelected = responses[q.id] === String(val);
                      return (
                        <TouchableOpacity
                          key={i}
                          style={styles.scaleDotContainer}
                          onPress={() => handleResponseChange(q.id, String(val))}
                        >
                          <View style={[styles.scaleDot, isSelected && { backgroundColor: activeColor, borderColor: activeColor }]} />
                          <Text style={[styles.scaleValue, { color: isSelected ? activeColor : textColor }]}>{val}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {q.type === 'File upload' && (
                <View style={styles.uploadContainer}>
                  {fileUploads[q.id] ? (
                    <View style={styles.filePreview}>
                      <Image source={{ uri: fileUploads[q.id].uri }} style={styles.previewImage} />
                      <View style={styles.filePreviewInfo}>
                        <Text style={{ color: textColor, fontSize: 13 }} numberOfLines={1}>{fileUploads[q.id].name}</Text>
                        <TouchableOpacity onPress={() => {
                          const newUploads = { ...fileUploads };
                          delete newUploads[q.id];
                          setFileUploads(newUploads);
                        }}>
                          <Text style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.uploadBtn, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', borderColor: '#3b82f6' }]}
                      onPress={() => handleFilePick(q.id)}
                    >
                      <Upload size={20} color="#3b82f6" />
                      <Text style={{ color: '#3b82f6', fontWeight: '500', marginTop: 8 }}>Select Image</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: isDark ? '#1e293b' : '#fff', borderTopColor: borderColor }]}>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: activeColor, opacity: isSubmitting ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Task</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  questionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
  },
  optionsList: {
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 15,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linearScale: {
    marginTop: 8,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scaleDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scaleDotContainer: {
    alignItems: 'center',
    gap: 6,
  },
  scaleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94a3b8',
    backgroundColor: 'transparent',
  },
  scaleValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  uploadContainer: {
    marginTop: 8,
  },
  uploadBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 8,
    borderRadius: 8,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  filePreviewInfo: {
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
