import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { X } from "lucide-react-native";

interface VideoModalProps {
  visible: boolean;
  onClose: () => void;
  videoSrc: any; // string (url) or number (require)
}

export default function VideoModal({
  visible,
  onClose,
  videoSrc,
}: VideoModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={24} color="#000" />
          </TouchableOpacity>

          {visible && <VideoContent videoSrc={videoSrc} />}
        </View>
      </View>
    </Modal>
  );
}

function VideoContent({ videoSrc }: { videoSrc: any }) {
  const player = useVideoPlayer(videoSrc, (player) => {
    player.loop = true;
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        player.play();
      } catch (e) {
        console.log("Error playing video:", e);
      }
    }, 500); // 500ms delay to ensure view is mounted

    return () => clearTimeout(timeout);
  }, [player]);

  return (
    <VideoView style={styles.video} player={player} contentFit="contain" />
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeBtn: {
    alignSelf: "flex-end",
    padding: 10,
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    backgroundColor: "#000", // Ensure black background
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 10,
    top: 50, // Offset for close button
    height: 200,
  },
  errorOverlay: {
    position: "absolute",
    top: 50,
    left: 10, // Adjust based on padding
    right: 10,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 10,
  },
  errorText: {
    color: "#ef4444",
    fontWeight: "600",
  },
});
