import React, { useState } from 'react';
import styles from './FormBuilder.module.css';
import { Plus, Trash2, Copy, UploadCloud, ChevronUp, ChevronDown, Calendar, Clock, Star, MoreVertical, Heart, ThumbsUp } from 'lucide-react';

export type QuestionType =
  | 'Short answer'
  | 'Paragraph'
  | 'Multiple choice'
  | 'Checkboxes'
  | 'Dropdown'
  | 'File upload'
  | 'Linear scale'
  | 'Rating'
  | 'Multiple choice grid'
  | 'Checkbox grid'
  | 'Date'
  | 'Time';

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  options: string[];
  rows?: string[];
  columns?: string[];
  required: boolean;
  ratingScale?: number;
  ratingIcon?: string;
  fileUploadSpecificTypes?: boolean;
  fileUploadMaxFiles?: number;
  fileUploadMaxSize?: string;
  linearScaleMin?: number;
  linearScaleMax?: number;
  linearScaleMinLabel?: string;
  linearScaleMaxLabel?: string;
}

export interface FormConfig {
  title: string;
  description: string;
  hasRewards?: boolean;
  reward_free?: number;
  reward_member?: number;
  questions: Question[];
}

interface FormBuilderProps {
  onSave: (config: FormConfig) => void;
  onCancel: () => void;
  initialTitle?: string;
  initialConfig?: FormConfig;
}

const QUESTION_TYPES: QuestionType[] = [
  'Short answer',
  'Paragraph',
  'Multiple choice',
  'Checkboxes',
  'Dropdown',
  'File upload',
  'Linear scale',
  'Rating',
  'Multiple choice grid',
  'Checkbox grid',
  'Date',
  'Time',
];

export default function FormBuilder({ onSave, onCancel, initialTitle = '', initialConfig }: FormBuilderProps) {
  const [formTitle, setFormTitle] = useState(initialConfig?.title || initialTitle || 'Untitled form');
  const [formDescription, setFormDescription] = useState(initialConfig?.description || '');
  const [hasRewards, setHasRewards] = useState(initialConfig?.hasRewards || false);
  const [rewardFree, setRewardFree] = useState<string>(initialConfig?.reward_free ? initialConfig.reward_free.toString() : '');
  const [rewardMember, setRewardMember] = useState<string>(initialConfig?.reward_member ? initialConfig.reward_member.toString() : '');
  const [questions, setQuestions] = useState<Question[]>(() => 
    initialConfig?.questions || [
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'Multiple choice',
        title: 'Untitled Question',
        options: ['Option 1'],
        required: false,
      },
    ]
  );
  const [activeQuestionId, setActiveQuestionId] = useState<string>(questions[0].id);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'Multiple choice',
      title: 'Untitled Question',
      options: ['Option 1'],
      rows: ['Row 1'],
      columns: ['Column 1'],
      required: false,
      ratingScale: 5,
      ratingIcon: 'Star',
    };
    setQuestions([...questions, newQuestion]);
    setActiveQuestionId(newQuestion.id);
  };

  const duplicateQuestion = (index: number) => {
    const qToCopy = questions[index];
    const newQuestion: Question = {
      ...qToCopy,
      id: Math.random().toString(36).substr(2, 9),
      options: [...qToCopy.options],
      rows: qToCopy.rows ? [...qToCopy.rows] : undefined,
      columns: qToCopy.columns ? [...qToCopy.columns] : undefined,
      ratingScale: qToCopy.ratingScale,
      ratingIcon: qToCopy.ratingIcon,
      fileUploadSpecificTypes: qToCopy.fileUploadSpecificTypes,
      fileUploadMaxFiles: qToCopy.fileUploadMaxFiles,
      fileUploadMaxSize: qToCopy.fileUploadMaxSize,
      linearScaleMin: qToCopy.linearScaleMin,
      linearScaleMax: qToCopy.linearScaleMax,
      linearScaleMinLabel: qToCopy.linearScaleMinLabel,
      linearScaleMaxLabel: qToCopy.linearScaleMaxLabel,
    };
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, newQuestion);
    setQuestions(newQuestions);
    setActiveQuestionId(newQuestion.id);
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) return; // Prevent removing last question
    const newQuestions = questions.filter((q) => q.id !== id);
    setQuestions(newQuestions);
    if (activeQuestionId === id) {
      setActiveQuestionId(newQuestions[0].id);
    }
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const addOption = (questionId: string) => {
    const q = questions.find((q) => q.id === questionId);
    if (q) {
      updateQuestion(questionId, {
        options: [...q.options, `Option ${q.options.length + 1}`],
      });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, newValue: string) => {
    const q = questions.find((q) => q.id === questionId);
    if (q) {
      const newOptions = [...q.options];
      newOptions[optionIndex] = newValue;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const q = questions.find((q) => q.id === questionId);
    if (q && q.options.length > 1) {
      const newOptions = [...q.options];
      newOptions.splice(optionIndex, 1);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const addGridItem = (questionId: string, type: 'rows' | 'columns') => {
    const q = questions.find((q) => q.id === questionId);
    if (q) {
      const current = q[type] || [];
      updateQuestion(questionId, {
        [type]: [...current, `${type === 'rows' ? 'Row' : 'Column'} ${current.length + 1}`],
      });
    }
  };

  const updateGridItem = (questionId: string, type: 'rows' | 'columns', index: number, newValue: string) => {
    const q = questions.find((q) => q.id === questionId);
    if (q) {
      const current = q[type] ? [...q[type]] : [];
      current[index] = newValue;
      updateQuestion(questionId, { [type]: current });
    }
  };

  const removeGridItem = (questionId: string, type: 'rows' | 'columns', index: number) => {
    const q = questions.find((q) => q.id === questionId);
    if (q) {
      const current = q[type] ? [...q[type]] : [];
      if (current.length > 1) {
        current.splice(index, 1);
        updateQuestion(questionId, { [type]: current });
      }
    }
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newQuestions = [...questions];
      [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
      setQuestions(newQuestions);
    } else if (direction === 'down' && index < questions.length - 1) {
      const newQuestions = [...questions];
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
      setQuestions(newQuestions);
    }
  };

  const handleSave = () => {
    onSave({
      title: formTitle,
      description: formDescription,
      hasRewards,
      reward_free: hasRewards ? parseFloat(rewardFree) || 0 : 0,
      reward_member: hasRewards ? parseFloat(rewardMember) || 0 : 0,
      questions,
    });
  };

  const renderOptionInputIcon = (type: QuestionType) => {
    if (type === 'Multiple choice' || type === 'Multiple choice grid') {
      return <div className={styles.optionCircle} />;
    }
    if (type === 'Checkboxes' || type === 'Checkbox grid') {
      return <div className={styles.optionSquare} />;
    }
    return <div style={{ width: 16, height: 16, textAlign: 'center', lineHeight: '16px', fontSize: 12 }}>{`> `}</div>;
  };

  const renderRatingIcon = (iconName: string = 'Star', size: number = 24) => {
    switch (iconName) {
      case 'Heart': return <Heart size={size} color="#5f6368" />;
      case 'Thumb up': return <ThumbsUp size={size} color="#5f6368" />;
      case 'Star':
      default:
        return <Star size={size} color="#5f6368" />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerCard}>
        <input
          type="text"
          className={styles.titleInput}
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="Form title"
        />
        <input
          type="text"
          className={styles.descInput}
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          placeholder="Form description"
        />
        
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #dadce0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#202124' }}>HAS REWARDS?</span>
            <label className={styles.switch} style={{ margin: 0 }}>
              <input
                type="checkbox"
                checked={hasRewards}
                onChange={(e) => setHasRewards(e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
          
          {hasRewards && (
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5f6368', marginBottom: '8px' }}>REWARD (MEMBERS) ₹</label>
                <input
                  type="number"
                  className={styles.textInput}
                  value={rewardMember}
                  onChange={(e) => setRewardMember(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5f6368', marginBottom: '8px' }}>REWARD (FREE) ₹</label>
                <input
                  type="number"
                  className={styles.textInput}
                  value={rewardFree}
                  onChange={(e) => setRewardFree(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {questions.map((q, index) => {
        const isActive = activeQuestionId === q.id;
        return (
          <div
            key={q.id}
            className={`${styles.questionCard} ${isActive ? styles.questionCardActive : ''}`}
            onClick={() => setActiveQuestionId(q.id)}
          >
            <div className={styles.questionHeader}>
              <input
                type="text"
                className={styles.questionTitleInput}
                value={q.title}
                onChange={(e) => updateQuestion(q.id, { title: e.target.value })}
                placeholder="Question"
              />
              {isActive && (
                <select
                  className={styles.typeSelect}
                  value={q.type}
                  onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType })}
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className={styles.optionsList}>
              {q.type === 'Short answer' && (
                <div className={styles.textPreview}>Short answer text</div>
              )}
              {q.type === 'Date' && (
                <div className={styles.textPreview} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Month, day, year <Calendar size={16} />
                </div>
              )}
              {q.type === 'Time' && (
                <div className={styles.textPreview} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Time <Clock size={16} />
                </div>
              )}
              {q.type === 'Paragraph' && (
                <div className={styles.paragraphPreview}>Long answer text</div>
              )}
              {q.type === 'File upload' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px 0' }}>
                  {isActive ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#202124' }}>Allow only specific file types</span>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={q.fileUploadSpecificTypes || false}
                            onChange={(e) => updateQuestion(q.id, { fileUploadSpecificTypes: e.target.checked })}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#202124' }}>Maximum number of files</span>
                        <select 
                          className={styles.typeSelect} 
                          style={{ minWidth: '80px' }}
                          value={q.fileUploadMaxFiles || 1}
                          onChange={(e) => updateQuestion(q.id, { fileUploadMaxFiles: parseInt(e.target.value) })}
                        >
                          {[1, 5, 10].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#202124' }}>Maximum file size</span>
                        <select 
                          className={styles.typeSelect} 
                          style={{ minWidth: '100px' }}
                          value={q.fileUploadMaxSize || '10 MB'}
                          onChange={(e) => updateQuestion(q.id, { fileUploadMaxSize: e.target.value })}
                        >
                          {['1 MB', '10 MB', '100 MB', '1 GB', '10 GB'].map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className={styles.fileUploadPreview}>
                      <UploadCloud size={24} />
                      <span>File upload</span>
                    </div>
                  )}
                </div>
              )}
              {['Multiple choice', 'Checkboxes', 'Dropdown'].includes(q.type) && (
                <>
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className={styles.optionItem}>
                      <div className={styles.optionIcon}>
                        {renderOptionInputIcon(q.type)}
                      </div>
                      <input
                        type="text"
                        className={styles.optionInput}
                        value={opt}
                        onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                        disabled={!isActive}
                      />
                      {isActive && q.options.length > 1 && (
                        <button
                          className={styles.removeOptionBtn}
                          onClick={() => removeOption(q.id, optIndex)}
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                  {isActive && (
                    <div className={styles.optionItem}>
                      <div className={styles.optionIcon}>
                        {renderOptionInputIcon(q.type)}
                      </div>
                      <button className={styles.addOptionBtn} onClick={() => addOption(q.id)}>
                        Add option
                      </button>
                    </div>
                  )}
                </>
              )}
              {q.type === 'Linear scale' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px 0' }}>
                  {isActive ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <select 
                          className={styles.typeSelect} 
                          style={{ minWidth: '60px' }}
                          value={q.linearScaleMin ?? 1}
                          onChange={(e) => updateQuestion(q.id, { linearScaleMin: parseInt(e.target.value) })}
                        >
                          <option value={0}>0</option>
                          <option value={1}>1</option>
                        </select>
                        <span style={{ color: '#202124', fontSize: '14px' }}>to</span>
                        <select 
                          className={styles.typeSelect} 
                          style={{ minWidth: '60px' }}
                          value={q.linearScaleMax ?? 5}
                          onChange={(e) => updateQuestion(q.id, { linearScaleMax: parseInt(e.target.value) })}
                        >
                          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ color: '#202124', fontSize: '14px', width: '20px' }}>{q.linearScaleMin ?? 1}</span>
                          <input
                            type="text"
                            className={styles.optionInput}
                            value={q.linearScaleMinLabel || ''}
                            onChange={(e) => updateQuestion(q.id, { linearScaleMinLabel: e.target.value })}
                            placeholder="Label (optional)"
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ color: '#202124', fontSize: '14px', width: '20px' }}>{q.linearScaleMax ?? 5}</span>
                          <input
                            type="text"
                            className={styles.optionInput}
                            value={q.linearScaleMaxLabel || ''}
                            onChange={(e) => updateQuestion(q.id, { linearScaleMaxLabel: e.target.value })}
                            placeholder="Label (optional)"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '16px 0', overflowX: 'auto' }}>
                      {q.linearScaleMinLabel && <span style={{ fontSize: '14px', color: '#202124' }}>{q.linearScaleMinLabel}</span>}
                      {Array.from({ length: (q.linearScaleMax ?? 5) - (q.linearScaleMin ?? 1) + 1 }).map((_, i) => {
                        const val = (q.linearScaleMin ?? 1) + i;
                        return (
                          <div key={val} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '14px', color: '#202124' }}>{val}</span>
                            <div className={styles.optionCircle} />
                          </div>
                        );
                      })}
                      {q.linearScaleMaxLabel && <span style={{ fontSize: '14px', color: '#202124' }}>{q.linearScaleMaxLabel}</span>}
                    </div>
                  )}
                </div>
              )}
              {q.type === 'Rating' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '8px 0' }}>
                  {isActive && (
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <select 
                        className={styles.typeSelect} 
                        style={{ minWidth: '80px' }}
                        value={q.ratingScale || 5}
                        onChange={(e) => updateQuestion(q.id, { ratingScale: parseInt(e.target.value) })}
                      >
                        {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                      <select
                        className={styles.typeSelect}
                        style={{ minWidth: '100px' }}
                        value={q.ratingIcon || 'Star'}
                        onChange={(e) => updateQuestion(q.id, { ratingIcon: e.target.value })}
                      >
                        <option value="Star">Star</option>
                        <option value="Heart">Heart</option>
                        <option value="Thumb up">Thumb up</option>
                      </select>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '32px', justifyContent: isActive ? 'flex-start' : 'center', marginTop: isActive ? '16px' : '0' }}>
                    {Array.from({ length: q.ratingScale || 5 }).map((_, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <span style={{ color: '#202124', fontSize: '14px' }}>{i + 1}</span>
                        {renderRatingIcon(q.ratingIcon, 28)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {['Multiple choice grid', 'Checkbox grid'].includes(q.type) && (
                <div style={{ display: 'flex', gap: '32px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: 8, color: '#5f6368', fontSize: 14 }}>Rows</div>
                    {(q.rows || []).map((row, rIndex) => (
                      <div key={rIndex} className={styles.optionItem} style={{ marginBottom: 8 }}>
                        <span style={{ color: '#dadce0', width: 20 }}>{rIndex + 1}.</span>
                        <input
                          type="text"
                          className={styles.optionInput}
                          value={row}
                          onChange={(e) => updateGridItem(q.id, 'rows', rIndex, e.target.value)}
                          placeholder={`Row ${rIndex + 1}`}
                          disabled={!isActive}
                        />
                        {isActive && (q.rows?.length || 0) > 1 && (
                          <button className={styles.removeOptionBtn} onClick={() => removeGridItem(q.id, 'rows', rIndex)}>&times;</button>
                        )}
                      </div>
                    ))}
                    {isActive && (
                      <div className={styles.optionItem}>
                        <span style={{ color: '#dadce0', width: 20 }}>{(q.rows?.length || 0) + 1}.</span>
                        <input
                          type="text"
                          className={styles.addOptionFakeInput}
                          placeholder="Add row"
                          onClick={() => addGridItem(q.id, 'rows')}
                          readOnly
                        />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: 8, color: '#5f6368', fontSize: 14 }}>Columns</div>
                    {(q.columns || []).map((col, cIndex) => (
                      <div key={cIndex} className={styles.optionItem} style={{ marginBottom: 8 }}>
                        <div className={styles.optionIcon}>{renderOptionInputIcon(q.type)}</div>
                        <input
                          type="text"
                          className={styles.optionInput}
                          value={col}
                          onChange={(e) => updateGridItem(q.id, 'columns', cIndex, e.target.value)}
                          placeholder={`Column ${cIndex + 1}`}
                          disabled={!isActive}
                        />
                        {isActive && (q.columns?.length || 0) > 1 && (
                          <button className={styles.removeOptionBtn} onClick={() => removeGridItem(q.id, 'columns', cIndex)}>&times;</button>
                        )}
                      </div>
                    ))}
                    {isActive && (
                      <div className={styles.optionItem}>
                        <div className={styles.optionIcon}>{renderOptionInputIcon(q.type)}</div>
                        <input
                          type="text"
                          className={styles.addOptionFakeInput}
                          placeholder="Add column"
                          onClick={() => addGridItem(q.id, 'columns')}
                          readOnly
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isActive && (
              <div className={styles.questionFooter}>
                <button
                  className={styles.iconBtn}
                  onClick={(e) => { e.stopPropagation(); moveQuestion(index, 'up'); }}
                  disabled={index === 0}
                  title="Move Up"
                >
                  <ChevronUp size={20} />
                </button>
                <button
                  className={styles.iconBtn}
                  onClick={(e) => { e.stopPropagation(); moveQuestion(index, 'down'); }}
                  disabled={index === questions.length - 1}
                  title="Move Down"
                >
                  <ChevronDown size={20} />
                </button>

                <div className={styles.divider} />

                <button
                  className={styles.iconBtn}
                  onClick={() => duplicateQuestion(index)}
                  title="Duplicate"
                >
                  <Copy size={20} />
                </button>
                <button
                  className={styles.iconBtn}
                  onClick={() => removeQuestion(q.id)}
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
                <div className={styles.divider} />
                <label className={styles.requiredToggle}>
                  {['Multiple choice grid', 'Checkbox grid'].includes(q.type) ? 'Require a response in each row' : 'Required'}
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </label>
                <button className={styles.iconBtn} title="More options" style={{ marginLeft: '-8px' }}>
                  <MoreVertical size={20} />
                </button>
              </div>
            )}
          </div>
        );
      })}

      <div className={styles.floatingToolbar}>
        <button className={styles.toolbarBtn} onClick={addQuestion} title="Add question">
          <Plus size={24} />
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            background: '#e2e8f0',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button className={styles.saveBtn} onClick={handleSave}>
          {initialConfig ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </div>
  );
}
