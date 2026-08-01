"use client";

import React, { useState } from "react";
import styles from "./CustomTaskRenderer.module.css";
import { Upload, CheckCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface CustomTaskRendererProps {
  task: any;
  onComplete: (responses: any, imageUrl: string | null) => void;
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;
}

export default function CustomTaskRenderer({ task, onComplete, isUploading, setIsUploading }: CustomTaskRendererProps) {
  const supabase = createClient();
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [fileUploads, setFileUploads] = useState<Record<string, File>>({});
  
  let config: any = null;
  try {
    if (task.steps) {
      config = JSON.parse(task.steps);
    }
  } catch (e) {
    console.error("Failed to parse custom task config", e);
  }

  if (!config || !config.questions) {
    return <div className={styles.error}>Invalid Custom Task Configuration</div>;
  }

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleFileChange = (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileUploads((prev) => ({ ...prev, [questionId]: e.target.files![0] }));
    }
  };

  const handleSubmit = async () => {
    // Validate required questions
    if (config?.questions) {
      for (const q of config.questions) {
        if (q.required) {
          if (q.type === 'File upload') {
            if (!fileUploads[q.id]) {
              alert(`Please upload a file for the required question: "${q.title}"`);
              return;
            }
          } else if (q.type === 'Checkboxes') {
            if (!responses[q.id] || responses[q.id].length === 0) {
              alert(`Please select at least one option for: "${q.title}"`);
              return;
            }
          } else if (q.type === 'Multiple choice grid' || q.type === 'Checkbox grid') {
            const isFullyAnswered = q.gridRows?.every((row: string) => {
              if (q.type === 'Checkbox grid') return responses[q.id]?.[row]?.length > 0;
              return !!responses[q.id]?.[row];
            });
            if (!isFullyAnswered) {
              alert(`Please answer all rows in the required question: "${q.title}"`);
              return;
            }
          } else {
            if (responses[q.id] === undefined || responses[q.id] === null || responses[q.id] === "") {
              alert(`Please fill out the required question: "${q.title}"`);
              return;
            }
          }
        }
      }
    }

    setIsUploading(true);
    try {
      const finalResponses = { ...responses };
      
      // Upload any files first
      for (const [qId, file] of Object.entries(fileUploads)) {
        const timestamp = Date.now();
        const path = `custom-task-uploads/${task.id}/${timestamp}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("task-submissions")
          .upload(path, file);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from("task-submissions")
          .getPublicUrl(uploadData.path);
          
        finalResponses[qId] = publicUrl;
      }
      
      // Default evidence image for custom task is null, we store it in responses JSON instead
      await onComplete(finalResponses, null);
    } catch (err) {
      console.error("Failed to submit custom task", err);
      alert("Failed to submit task. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{config.title}</h3>
        {config.description && <p className={styles.description}>{config.description}</p>}
      </div>

      <div className={styles.questionsContainer}>
        {config.questions.map((q: any) => (
          <div key={q.id} className={styles.questionCard}>
            <div className={styles.questionTitle}>
              {q.title}
              {q.required && <span className={styles.required}>*</span>}
            </div>
            
            {q.type === 'Short answer' && (
              <input
                type="text"
                className={styles.textInput}
                placeholder="Your answer"
                value={responses[q.id] || ''}
                onChange={(e) => handleResponseChange(q.id, e.target.value)}
              />
            )}

            {q.type === 'Paragraph' && (
              <textarea
                className={styles.textarea}
                placeholder="Your answer"
                rows={4}
                value={responses[q.id] || ''}
                onChange={(e) => handleResponseChange(q.id, e.target.value)}
              />
            )}

            {q.type === 'Multiple choice' && (
              <div className={styles.optionsList}>
                {q.options?.map((opt: string, idx: number) => (
                  <label key={idx} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name={`question_${q.id}`}
                      value={opt}
                      checked={responses[q.id] === opt}
                      onChange={(e) => handleResponseChange(q.id, e.target.value)}
                      className={styles.radioInput}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'Checkboxes' && (
              <div className={styles.optionsList}>
                {q.options?.map((opt: string, idx: number) => {
                  const checkedArray = responses[q.id] || [];
                  return (
                    <label key={idx} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={checkedArray.includes(opt)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleResponseChange(q.id, [...checkedArray, opt]);
                          } else {
                            handleResponseChange(q.id, checkedArray.filter((v: string) => v !== opt));
                          }
                        }}
                        className={styles.checkboxInput}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === 'Dropdown' && (
              <select
                className={styles.select}
                value={responses[q.id] || ''}
                onChange={(e) => handleResponseChange(q.id, e.target.value)}
              >
                <option value="" disabled>Choose</option>
                {q.options?.map((opt: string, idx: number) => (
                  <option key={idx} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {q.type === 'Linear scale' && (
              <div className={styles.linearScale}>
                {q.linearScaleMinLabel && <span className={styles.scaleLabel}>{q.linearScaleMinLabel}</span>}
                <div className={styles.scaleOptions}>
                  {Array.from({ length: (q.linearScaleMax ?? 5) - (q.linearScaleMin ?? 1) + 1 }).map((_, i) => {
                    const val = (q.linearScaleMin ?? 1) + i;
                    return (
                      <label key={val} className={styles.scaleItem}>
                        <span className={styles.scaleNumber}>{val}</span>
                        <input
                          type="radio"
                          name={`question_${q.id}`}
                          value={val.toString()}
                          checked={responses[q.id] === val.toString()}
                          onChange={(e) => handleResponseChange(q.id, e.target.value)}
                          className={styles.radioInput}
                        />
                      </label>
                    );
                  })}
                </div>
                {q.linearScaleMaxLabel && <span className={styles.scaleLabel}>{q.linearScaleMaxLabel}</span>}
              </div>
            )}

            {q.type === 'Rating' && (
              <div className={styles.rating}>
                {Array.from({ length: q.ratingScale ?? 5 }).map((_, i) => {
                  const val = i + 1;
                  return (
                    <label key={val} className={styles.ratingItem}>
                      <input
                        type="radio"
                        name={`question_${q.id}`}
                        value={val.toString()}
                        checked={responses[q.id] === val.toString()}
                        onChange={(e) => handleResponseChange(q.id, e.target.value)}
                        style={{ display: 'none' }}
                      />
                      <div className={`${styles.ratingIcon} ${responses[q.id] === val.toString() ? styles.ratingSelected : ''}`}>
                        {q.ratingIcon === 'Heart' ? '❤️' : q.ratingIcon === 'ThumbsUp' ? '👍' : '⭐'}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === 'File upload' && (
              <div className={styles.fileUpload}>
                <label className={styles.uploadBtn}>
                  <Upload size={18} /> Add file
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(q.id, e)}
                    style={{ display: 'none' }}
                  />
                </label>
                {fileUploads[q.id] && (
                  <div className={styles.fileSelected}>
                    <CheckCircle size={16} className={styles.checkIcon} /> {fileUploads[q.id].name}
                  </div>
                )}
              </div>
            )}

            {q.type === 'Multiple choice grid' && (
              <div className={styles.grid}>
                <div className={styles.gridRow}>
                  <div className={styles.gridCell}></div>
                  {q.gridColumns?.map((col: string, idx: number) => (
                    <div key={idx} className={styles.gridCellHeader}>{col}</div>
                  ))}
                </div>
                {q.gridRows?.map((row: string, rIdx: number) => (
                  <div key={rIdx} className={styles.gridRow}>
                    <div className={styles.gridCellRowLabel}>{row}</div>
                    {q.gridColumns?.map((col: string, cIdx: number) => (
                      <div key={cIdx} className={styles.gridCell}>
                        <input
                          type="radio"
                          name={`question_${q.id}_row_${rIdx}`}
                          value={col}
                          checked={responses[q.id]?.[row] === col}
                          onChange={(e) => {
                            const current = responses[q.id] || {};
                            handleResponseChange(q.id, { ...current, [row]: e.target.value });
                          }}
                          className={styles.radioInput}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {q.type === 'Checkbox grid' && (
              <div className={styles.grid}>
                <div className={styles.gridRow}>
                  <div className={styles.gridCell}></div>
                  {q.gridColumns?.map((col: string, idx: number) => (
                    <div key={idx} className={styles.gridCellHeader}>{col}</div>
                  ))}
                </div>
                {q.gridRows?.map((row: string, rIdx: number) => (
                  <div key={rIdx} className={styles.gridRow}>
                    <div className={styles.gridCellRowLabel}>{row}</div>
                    {q.gridColumns?.map((col: string, cIdx: number) => {
                      const checkedArray = responses[q.id]?.[row] || [];
                      return (
                        <div key={cIdx} className={styles.gridCell}>
                          <input
                            type="checkbox"
                            checked={checkedArray.includes(col)}
                            onChange={(e) => {
                              const current = responses[q.id] || {};
                              let newArray = [...checkedArray];
                              if (e.target.checked) {
                                newArray.push(col);
                              } else {
                                newArray = newArray.filter((v: string) => v !== col);
                              }
                              handleResponseChange(q.id, { ...current, [row]: newArray });
                            }}
                            className={styles.checkboxInput}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
            
            {q.type === 'Date' && (
              <input
                type="date"
                className={styles.textInput}
                value={responses[q.id] || ''}
                onChange={(e) => handleResponseChange(q.id, e.target.value)}
              />
            )}
            
            {q.type === 'Time' && (
              <input
                type="time"
                className={styles.textInput}
                value={responses[q.id] || ''}
                onChange={(e) => handleResponseChange(q.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.submitBtn} 
          onClick={handleSubmit}
          disabled={isUploading}
        >
          {isUploading ? <><Loader2 size={18} className={styles.spinner} /> Submitting...</> : "Submit Form"}
        </button>
      </div>
    </div>
  );
}
