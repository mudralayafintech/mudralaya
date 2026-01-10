"use client";

import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { X, Upload, Camera, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import styles from "./kyc-modal.module.css";

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

const KYCModal: React.FC<KYCModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState({
    pan: null as File | null,
    adhaar: null as File | null,
    bank: null as File | null,
    selfie: null as string | null, // Base64 string from webcam
  });
  const webcamRef = useRef<Webcam>(null);
  const supabase = createClient();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments((prev) => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  const captureSelfie = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setDocuments((prev) => ({ ...prev, selfie: imageSrc }));
    }
  }, [webcamRef]);

  const retakeSelfie = () => {
    setDocuments((prev) => ({ ...prev, selfie: null }));
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("kyc-documents")
      .upload(path, file, { upsert: true });

    if (error) throw error;
    return data.path;
  };

  const uploadBase64 = async (base64Data: string, path: string) => {
    const res = await fetch(base64Data);
    const blob = await res.blob();
    const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
    return uploadFile(file, path);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (
        !documents.pan ||
        !documents.adhaar ||
        !documents.bank ||
        !documents.selfie
      ) {
        alert("Please upload all required documents.");
        setLoading(false);
        return;
      }

      // 1. Upload Files
      const timestamp = Date.now();
      const panPath = `${userId}/pan_${timestamp}.jpg`;
      const adhaarPath = `${userId}/adhaar_${timestamp}.jpg`;
      const bankPath = `${userId}/bank_${timestamp}.jpg`;
      const selfiePath = `${userId}/selfie_${timestamp}.jpg`;

      const [panRes, adhaarRes, bankRes, selfieRes] = await Promise.all([
        uploadFile(documents.pan, panPath),
        uploadFile(documents.adhaar, adhaarPath),
        uploadFile(documents.bank, bankPath),
        uploadBase64(documents.selfie, selfiePath),
      ]);

      // 2. Call Edge Function (or direct insert if easier, but plan said Edge Function)
      // Since we established the edge function logic, let's call it.
      const { data: funcData, error: funcError } =
        await supabase.functions.invoke("kyc-api", {
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

      if (funcError) throw funcError;

      alert("KYC Submitted Successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("KYC Submit Error:", error);
      alert(`Submission failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.header}>
          <h2>Complete Your KYC</h2>
          <p>Step {step} of 2</p>
        </div>

        <div className={styles.content}>
          {step === 1 ? (
            <div className={styles.stepContainer}>
              <div className={styles.uploadGroup}>
                <label>1. PAN Card</label>
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, "pan")}
                    accept="image/*,.pdf"
                  />
                  <div className={styles.filePlaceholder}>
                    {documents.pan ? (
                      <div className={styles.fileSelected}>
                        <CheckCircle size={20} color="#10b981" />
                        <span>{documents.pan.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={20} />
                        <span>Upload PAN Card</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.uploadGroup}>
                <label>2. Aadhaar Card</label>
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, "adhaar")}
                    accept="image/*,.pdf"
                  />
                  <div className={styles.filePlaceholder}>
                    {documents.adhaar ? (
                      <div className={styles.fileSelected}>
                        <CheckCircle size={20} color="#10b981" />
                        <span>{documents.adhaar.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={20} />
                        <span>Upload Aadhaar Card</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.uploadGroup}>
                <label>3. Bank Proof (Passbook/Cancel Cheque)</label>
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, "bank")}
                    accept="image/*,.pdf"
                  />
                  <div className={styles.filePlaceholder}>
                    {documents.bank ? (
                      <div className={styles.fileSelected}>
                        <CheckCircle size={20} color="#10b981" />
                        <span>{documents.bank.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={20} />
                        <span>Upload Bank Proof</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                className={styles.nextBtn}
                onClick={() => setStep(2)}
                disabled={
                  !documents.pan || !documents.adhaar || !documents.bank
                }
              >
                Next: Take Selfie
              </button>
            </div>
          ) : (
            <div className={styles.stepContainer}>
              <label className={styles.stepLabel}>4. Live Selfie</label>
              <div className={styles.cameraBox}>
                {documents.selfie ? (
                  <img
                    src={documents.selfie}
                    alt="Selfie"
                    className={styles.capturedImage}
                  />
                ) : (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className={styles.webcam}
                    videoConstraints={{ facingMode: "user" }}
                  />
                )}
              </div>

              <div className={styles.cameraControls}>
                {documents.selfie ? (
                  <button className={styles.retakeBtn} onClick={retakeSelfie}>
                    Retake
                  </button>
                ) : (
                  <button className={styles.captureBtn} onClick={captureSelfie}>
                    <Camera size={20} /> Capture
                  </button>
                )}
              </div>

              <div className={styles.buttonGroup}>
                <button className={styles.backBtn} onClick={() => setStep(1)}>
                  Back
                </button>
                <button
                  className={styles.submitBtn}
                  onClick={handleSubmit}
                  disabled={!documents.selfie || loading}
                >
                  {loading ? "Submitting..." : "Submit KYC"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCModal;
