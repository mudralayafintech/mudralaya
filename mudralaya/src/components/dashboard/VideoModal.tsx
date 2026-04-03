"use client";

import React from "react";
import { X } from "lucide-react";
import styles from "./video-modal.module.css";

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoSrc: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoSrc }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={24} />
                </button>
                <div className={styles.videoWrapper}>
                    <video
                        className={styles.video}
                        src={videoSrc}
                        controls
                        autoPlay
                        playsInline
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        </div>
    );
};

export default VideoModal;
