import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Activity, 
  Scale, 
  Dumbbell, 
  Moon, 
  Heart, 
  RefreshCw, 
  Smartphone, 
  Award, 
  Camera, 
  Upload, 
  Trash2, 
  Sparkles,
  Eye,
  UserCheck,
  TrendingDown,
  ChevronRight,
  Maximize2,
  Settings,
  Key,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const BodyComp: React.FC = () => {
  const { bodyComp, syncStatus, syncGoogleFit, updateBodyCompDirect, user } = useApp();
  const [activeManualMetric, setActiveManualMetric] = useState<string | null>(null);
  const [manualValue, setManualValue] = useState('');
  
  // Local storage for body photos (uploaded by user)
  const [photos, setPhotos] = useState<{ front?: string; side?: string; back?: string }>(() => {
    try {
      const cached = localStorage.getItem('myjourney_body_photos_v1');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  // Local storage for generated AI previews
  const [aiPreviews, setAiPreviews] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem('myjourney_ai_previews_v1');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [generatingKey, setGeneratingKey] = useState<string | null>(null);
  const [genderModel, setGenderModel] = useState<'male' | 'female'>('male');
  const [activeZoomUrl, setActiveZoomUrl] = useState<string | null>(null);
  const [activeZoomLabel, setActiveZoomLabel] = useState<string>('');

  // AI Generation configuration states
  const [useGemini, setUseGemini] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('myjourney_use_gemini');
      return cached ? JSON.parse(cached) : false;
    } catch {
      return false;
    }
  });

  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    try {
      const cached = localStorage.getItem('myjourney_gemini_api_key');
      if (cached) return cached;
    } catch {}
    return (import.meta.env.VITE_GEMINI_API_KEY as string) || (import.meta.env.VITE_GOOGLE_API_KEY as string) || '';
  });

  const [geminiModel, setGeminiModel] = useState<string>(() => {
    try {
      const cached = localStorage.getItem('myjourney_gemini_model');
      return cached || 'gemini-3.1-flash-image';
    } catch {
      return 'gemini-3.1-flash-image';
    }
  });

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('myjourney_use_gemini', JSON.stringify(useGemini));
    } catch (e) {
      console.warn(e);
    }
  }, [useGemini]);

  useEffect(() => {
    try {
      localStorage.setItem('myjourney_gemini_api_key', geminiApiKey);
    } catch (e) {
      console.warn(e);
    }
  }, [geminiApiKey]);

  useEffect(() => {
    try {
      localStorage.setItem('myjourney_gemini_model', geminiModel);
    } catch (e) {
      console.warn(e);
    }
  }, [geminiModel]);

  const handlePhotoUpload = (angle: 'front' | 'side' | 'back', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large! Please upload an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        const updated = { ...photos, [angle]: base64 };
        setPhotos(updated);
        try {
          localStorage.setItem('myjourney_body_photos_v1', JSON.stringify(updated));
        } catch (err) {
          alert("Storage full! Try a smaller compressed photo.");
          console.warn("Storage write failed", err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const deletePhoto = (angle: 'front' | 'side' | 'back') => {
    const updated = { ...photos };
    delete updated[angle];
    setPhotos(updated);
    try {
      localStorage.setItem('myjourney_body_photos_v1', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
  };

  const metrics = [
    {
      id: 'weight',
      name: 'Body Weight',
      value: `${bodyComp.weight} kg`,
      desc: 'Overall mass',
      icon: Scale,
      color: 'var(--accent-orange)'
    },
    {
      id: 'fat',
      name: 'Body Fat %',
      value: `${bodyComp.fatPercent}%`,
      desc: 'Adipose ratio',
      icon: Activity,
      color: '#bf5af2' // purple
    },
    {
      id: 'muscle',
      name: 'Muscle Mass',
      value: `${bodyComp.muscleMass} kg`,
      desc: 'Skeletal mass',
      icon: Dumbbell,
      color: '#0a84ff' // blue
    },
    {
      id: 'steps',
      name: 'Daily Steps',
      value: `${bodyComp.steps.toLocaleString()} / 10,000`,
      desc: 'Active baseline',
      icon: Heart,
      color: 'var(--accent-green-dark)'
    },
    {
      id: 'sleep',
      name: 'Sleep Duration',
      value: `${bodyComp.sleepDuration} hrs`,
      desc: `Slept at ${bodyComp.sleepTime}`,
      icon: Moon,
      color: '#ffd60a' // yellow
    }
  ];

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(manualValue);
    if (isNaN(val) || val <= 0) return;

    if (activeManualMetric === 'weight') updateBodyCompDirect({ weight: val });
    if (activeManualMetric === 'fat') updateBodyCompDirect({ fatPercent: val });
    if (activeManualMetric === 'muscle') updateBodyCompDirect({ muscleMass: val });
    if (activeManualMetric === 'steps') updateBodyCompDirect({ steps: Math.floor(val) });
    if (activeManualMetric === 'sleep') updateBodyCompDirect({ sleepDuration: val });

    // Reset generated previews when weight or body fat changes so they can be regenerated
    setAiPreviews({});
    localStorage.removeItem('myjourney_ai_previews_v1');

    setManualValue('');
    setActiveManualMetric(null);
  };

  // Calculations for simulated AI visualization values
  const userWeight = user?.currentWeight || bodyComp.weight;
  const userFat = bodyComp.fatPercent;
  const userAge = user?.age || 34;
  const userHeight = user?.height || 178;

  const targetBf = 12;
  const ffm = userWeight * (1 - userFat / 100);
  const targetWeight = ffm / (1 - targetBf / 100);
  const milestoneWeight = userWeight - 5;
  const milestoneBf = userFat - ((userFat - targetBf) * (5 / (userWeight - targetWeight)));

  const handleGenerateAI = async (key: 'goal' | 'm_front' | 'm_side' | 'm_back', promptText: string) => {
    setGeneratingKey(key);
    
    try {
      if (useGemini) {
        // --- Gemini 3.1 Flash Image (Nano Banana 2) API call ---
        if (!geminiApiKey.trim()) {
          throw new Error("Gemini API key is required. Click the Settings gear icon above to configure it.");
        }
        
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey.trim()}`;
        
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: promptText
                  }
                ]
              }
            ],
            generationConfig: {
              responseModalities: ["IMAGE"]
            }
          })
        });
        
        if (!response.ok) {
          let errorMsg = `Gemini API returned status: ${response.status}`;
          try {
            const errJson = await response.json();
            if (errJson.error?.message) {
              errorMsg += ` - ${errJson.error.message}`;
            }
          } catch {}
          throw new Error(errorMsg);
        }
        
        const json = await response.json();
        const parts = json.candidates?.[0]?.content?.parts;
        if (!parts || parts.length === 0) {
          throw new Error("Gemini API response did not contain any generated content.");
        }
        
        const imagePart = parts.find((p: any) => p.inlineData || p.inline_data);
        if (!imagePart) {
          const textPart = parts.find((p: any) => p.text);
          if (textPart) {
            throw new Error(`Gemini API returned text instead of image: ${textPart.text}`);
          }
          throw new Error("No image data found in Gemini API response.");
        }
        
        const inlineData = imagePart.inlineData || imagePart.inline_data;
        const data = inlineData?.data;
        const mimeType = inlineData?.mimeType || inlineData?.mime_type || 'image/png';
        
        if (!data) {
          throw new Error("No base64 data found in Gemini image response part.");
        }
        
        const base64Data = `data:${mimeType};base64,${data}`;
        
        // Cache the preview dataURL
        const updated = { ...aiPreviews, [key]: base64Data };
        setAiPreviews(updated);
        localStorage.setItem('myjourney_ai_previews_v1', JSON.stringify(updated));
      } else {
        // --- Pollinations: download image via Image element + Canvas → base64 DataURL ---
        // We cannot use fetch() because Pollinations blocks cross-origin requests with 403.
        // Instead we load it into an <img> element, draw to canvas, and export as base64.
        // This bypasses CORS on the request side while giving us a stable base64 string.
        const encodedPrompt = encodeURIComponent(promptText);
        const seed = Math.floor(Math.random() * 1000000);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&enhance=false&seed=${seed}`;
        
        const base64Data = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          // Do NOT set crossOrigin — we want the browser to load it without CORS preflight
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth || 512;
              canvas.height = img.naturalHeight || 512;
              const ctx = canvas.getContext('2d');
              if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
              ctx.drawImage(img, 0, 0);
              // toDataURL will throw a SecurityError if CORS tainting occurred.
              // Without crossOrigin attribute, most CDN images don't taint the canvas.
              const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
              if (!dataUrl || dataUrl === 'data:,') {
                reject(new Error('Canvas export produced empty image'));
              } else {
                resolve(dataUrl);
              }
            } catch (canvasErr: any) {
              // Canvas tainted — Pollinations blocked the export.
              // Fall back to storing the URL directly as last resort.
              console.warn('Canvas tainted by Pollinations CORS. Storing raw URL as fallback.', canvasErr);
              resolve(url);
            }
          };
          img.onerror = () => {
            reject(new Error(
              'Pollinations AI could not generate the image. This is a free public API with rate limits. ' +
              'Please try again in a few seconds, or switch to Gemini AI in Settings for reliable results.'
            ));
          };
          // Set a 60-second timeout for the image to load
          const timeout = setTimeout(() => {
            img.src = '';
            reject(new Error('Pollinations AI timed out after 60 seconds. Try again or switch to Gemini AI.'));
          }, 60000);
          img.onload = function() {
            clearTimeout(timeout);
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth || 512;
              canvas.height = img.naturalHeight || 512;
              const ctx = canvas.getContext('2d');
              if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
              if (!dataUrl || dataUrl === 'data:,') {
                reject(new Error('Canvas export produced empty image'));
              } else {
                resolve(dataUrl);
              }
            } catch (canvasErr: any) {
              console.warn('Canvas tainted — storing URL as fallback:', canvasErr);
              resolve(url);
            }
          };
          img.src = url;
        });
        
        // Cache the base64 (or fallback URL)
        const updated = { ...aiPreviews, [key]: base64Data };
        setAiPreviews(updated);
        localStorage.setItem('myjourney_ai_previews_v1', JSON.stringify(updated));
      }
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      const msg = err.message || "Failed to connect to the image generation pipeline. Check your internet connection.";
      setGenerationError(msg);
      setShowSettings(true); // auto-open settings so user can switch to Gemini or fix key
    } finally {
      setGeneratingKey(null);
    }
  };

  // Prompts Builder based on active state parameters
  const getPrompt = (type: 'goal' | 'm_front' | 'm_side' | 'm_back') => {
    const genderNoun = genderModel === 'male' ? 'male fitness model' : 'female fitness model';
    const bottomNoun = genderModel === 'male' ? 'dark athletic shorts' : 'dark athletic sports bra and shorts';
    const muscularity = genderModel === 'male' ? 'defined abdominal muscles, a flat stomach, and sculpted shoulder and arm muscle definition' : 'toned core, flat stomach, and sculpted shoulder and leg definition';
    
    switch (type) {
      case 'goal':
        return `A realistic, high-detail full-body studio photograph of a ${userAge}-year-old ${genderNoun}, ${userHeight} cm tall, weighing ${targetWeight.toFixed(1)} kg. Visibly lean and athletic physique with 12% body fat, featuring a ${muscularity}. Standing in a neutral, relaxed posture, front-view perspective. Wearing simple ${bottomNoun}. Natural skin texture, soft professional studio lighting, neutral clean gray background, photorealistic.`;
      case 'm_front':
        return `A realistic, high-detail full-body studio photograph of a ${userAge}-year-old ${genderNoun}, ${userHeight} cm tall, weighing ${milestoneWeight.toFixed(1)} kg. Moderately lean and toned physique with ${milestoneBf.toFixed(1)}% body fat, showcasing a flatter stomach and early core muscle definition. Standing in a neutral, relaxed posture, front-view perspective. Wearing simple ${bottomNoun}. Natural skin texture, soft professional studio lighting, neutral clean gray background, photorealistic.`;
      case 'm_side':
        return `A realistic, high-detail full-body studio photograph of a ${userAge}-year-old ${genderNoun}, ${userHeight} cm tall, weighing ${milestoneWeight.toFixed(1)} kg, captured from a 45-degree side angle. Moderately lean and toned physique with ${milestoneBf.toFixed(1)}% body fat, showing a flatter midsection, straight posture, and defined oblique lines. Wearing simple ${bottomNoun}. Natural skin texture, soft professional studio lighting, neutral clean gray background, photorealistic.`;
      case 'm_back':
        return `A realistic, high-detail full-body studio photograph of a ${userAge}-year-old ${genderNoun} from a rear-view perspective, ${userHeight} cm tall, weighing ${milestoneWeight.toFixed(1)} kg. Moderately toned back with ${milestoneBf.toFixed(1)}% body fat, showing visible shoulder blade and latissimus muscle definition. Wearing simple ${bottomNoun}. Natural skin texture, soft professional studio lighting, neutral clean gray background, photorealistic.`;
    }
  };

  const previewCards = [
    {
      key: 'goal' as const,
      label: `YOUR GOAL — ${targetWeight.toFixed(1)} kg`,
      bf: '12% Body Fat',
      type: 'Target',
      color: 'var(--accent-orange)',
      prompt: getPrompt('goal'),
      uploadedPhoto: photos.front
    },
    {
      key: 'm_front' as const,
      label: `MILESTONE — ${milestoneWeight.toFixed(1)} kg`,
      bf: `${milestoneBf.toFixed(1)}% Body Fat`,
      type: 'Front View',
      color: 'var(--accent-purple)',
      prompt: getPrompt('m_front'),
      uploadedPhoto: photos.front
    },
    {
      key: 'm_side' as const,
      label: `MILESTONE — ${milestoneWeight.toFixed(1)} kg`,
      bf: `${milestoneBf.toFixed(1)}% Body Fat`,
      type: 'Side View',
      color: '#bf5af2',
      prompt: getPrompt('m_side'),
      uploadedPhoto: photos.side
    },
    {
      key: 'm_back' as const,
      label: `MILESTONE — ${milestoneWeight.toFixed(1)} kg`,
      bf: `${milestoneBf.toFixed(1)}% Body Fat`,
      type: 'Back View',
      color: '#0a84ff',
      prompt: getPrompt('m_back'),
      uploadedPhoto: photos.back
    }
  ];

  return (
    <div className="anim-fade-up">
      {/* Google Fit Integration Panel */}
      <div className="journey-card" style={{
        background: 'linear-gradient(to right, rgba(28,28,30,0.9), rgba(20,20,22,0.95))',
        border: '1px solid var(--border-color)',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{
            backgroundColor: 'rgba(10, 132, 255, 0.1)',
            border: '1px solid #0a84ff',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Smartphone size={20} color="#0a84ff" />
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}>
              Google Fit API Pipeline
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Sync weight, steps, sleep cycles, and composition.
            </p>
          </div>
        </div>

        {/* Sync trigger button */}
        <button
          onClick={syncGoogleFit}
          disabled={syncStatus === 'syncing'}
          className="btn btn-primary"
          style={{
            backgroundColor: syncStatus === 'connected' ? 'var(--accent-green-dark)' : 'var(--accent-orange)',
            boxShadow: syncStatus === 'connected' ? '0 4px 12px var(--accent-green-glow)' : '0 4px 12px var(--accent-orange-glow)',
            fontSize: '0.82rem',
            padding: '12px 0'
          }}
        >
          <RefreshCw size={14} style={{
            animation: syncStatus === 'syncing' ? 'spin-slow 1.5s linear infinite' : 'none'
          }} />
          {syncStatus === 'idle' && 'Sync Google Fit'}
          {syncStatus === 'syncing' && 'Syncing REST Endpoints...'}
          {syncStatus === 'connected' && 'Google Fit Connected & Synced'}
        </button>

        {syncStatus === 'connected' && (
          <div className="anim-fade-up" style={{
            backgroundColor: 'rgba(57, 255, 20, 0.05)',
            border: '1px solid var(--accent-green-dark)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            marginTop: '14px',
            fontSize: '0.8rem',
            color: 'var(--text-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', color: 'var(--accent-green)' }}>
              <Award size={14} /> Automation Trigger Fired:
            </div>
            Sleep time registered at <strong>{bodyComp.sleepTime}</strong> (before 10:30 PM limit). Habit <strong>"Sleep on Time"</strong> has been automatically logged and toggled to true! (+10 XP awarded).
          </div>
        )}
      </div>

      {/* Body Photos / Transformation Tracker */}
      <h3 className="heading-section" style={{ marginTop: '24px', marginBottom: '16px', fontSize: '1.1rem' }}>
        Transformation Gallery
      </h3>

      <div className="journey-card" style={{
        background: 'linear-gradient(145deg, rgba(28,28,30,0.95), rgba(18,18,22,0.98))',
        border: '1px solid var(--border-color)',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Current Checkpoint Photos
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', margin: '2px 0 0 0' }}>
              Upload views to activate body shape predictive AI.
            </p>
          </div>
        </div>

        {/* 3-Column Upload Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          {(['front', 'side', 'back'] as const).map((angle) => {
            const photoUrl = photos[angle];
            return (
              <div key={angle} style={{
                position: 'relative',
                width: '100%',
              }}>
                <input
                  type="file"
                  id={`upload-${angle}`}
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(angle, e)}
                  style={{ display: 'none' }}
                />
                
                {photoUrl ? (
                  /* Photo slot filled */
                  <div style={{
                    width: '100%',
                    aspectRatio: '3/4',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative',
                  }}>
                    <img 
                      src={photoUrl} 
                      alt={`${angle} view`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Delete overlay */}
                    <button
                      onClick={() => deletePhoto(angle)}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        color: '#ff4d4d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                      title={`Remove ${angle} view`}
                    >
                      <Trash2 size={12} />
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      padding: '3px 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                      {angle}
                    </div>
                  </div>
                ) : (
                  /* Photo slot empty / Upload Box */
                  <label 
                    htmlFor={`upload-${angle}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      aspectRatio: '3/4',
                      borderRadius: '12px',
                      border: '1.5px dashed var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-orange)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)';
                    }}
                  >
                    <Camera size={18} color="var(--text-secondary)" style={{ marginBottom: '6px' }} />
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      textTransform: 'capitalize'
                    }}>
                      {angle}
                    </span>
                    <span style={{
                      fontSize: '0.55rem',
                      color: 'var(--text-muted)',
                      marginTop: '2px'
                    }}>
                      Tap to upload
                    </span>
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Transformation Preview Pipeline Cards */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="heading-section" style={{ margin: 0, fontSize: '1.1rem' }}>
          AI Avatar Pipeline Previews
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: showSettings ? 'var(--accent-orange)' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}
          title="AI Pipeline Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Error Banner */}
      {generationError && (
        <div className="anim-fade-up" style={{
          backgroundColor: 'rgba(255, 59, 48, 0.08)',
          border: '1px solid rgba(255, 59, 48, 0.4)',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ff6b6b', marginBottom: '4px' }}>
              Image Generation Failed
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {generationError}
            </div>
            {!useGemini && (
              <button
                onClick={() => { setUseGemini(true); setShowSettings(true); setGenerationError(null); }}
                style={{
                  marginTop: '10px',
                  padding: '7px 14px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ✨ Switch to Gemini AI (Recommended)
              </button>
            )}
          </div>
          <button
            onClick={() => setGenerationError(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: 0 }}
          >✕</button>
        </div>
      )}

      {showSettings && (
        <div className="journey-card anim-fade-up" style={{
          background: 'linear-gradient(to right, rgba(28,28,30,0.95), rgba(20,20,22,0.98))',
          border: '1px solid var(--border-color)',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
            <Settings size={16} color="var(--accent-orange)" />
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fff' }}>
              AI Generation Settings
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Selection */}
            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Choose Generation Engine:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setUseGemini(false)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: useGemini ? '1px solid var(--border-color)' : '1px solid var(--accent-orange)',
                    background: useGemini ? 'rgba(0,0,0,0.2)' : 'rgba(255, 94, 0, 0.05)',
                    color: useGemini ? 'var(--text-secondary)' : '#fff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  Free Public API
                  <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: '2px' }}>
                    Pollinations AI (No Key)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setUseGemini(true)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: useGemini ? '1px solid var(--accent-orange)' : '1px solid var(--border-color)',
                    background: useGemini ? 'rgba(255, 94, 0, 0.05)' : 'rgba(0,0,0,0.2)',
                    color: useGemini ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  Google Gemini API
                  <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: '2px' }}>
                    Nano Banana 2 (Key Req.)
                  </span>
                </button>
              </div>
            </div>

            {useGemini && (
              <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* API Key */}
                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Google AI Studio API Key:
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="Paste your AI Studio API key here"
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--border-color)',
                        color: '#fff',
                        padding: '10px 40px 10px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-orange)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showApiKey ? <Eye size={16} /> : <Lock size={16} />}
                    </button>
                  </div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Get your key at{' '}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--accent-orange)', textDecoration: 'underline' }}
                    >
                      aistudio.google.com/apikey
                    </a>
                  </span>
                </div>

                {/* Billing tier info card */}
                <div style={{
                  backgroundColor: 'rgba(255, 200, 0, 0.06)',
                  border: '1px solid rgba(255, 200, 0, 0.25)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '0.73rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ fontWeight: 700, color: '#ffd60a', marginBottom: '4px' }}>⚡ Google AI Pro ≠ Gemini API billing</div>
                  <div>Your <strong style={{ color: '#fff' }}>Google AI Pro / Google One</strong> subscription is for <strong style={{ color: '#fff' }}>gemini.google.com chat</strong> — it does <em>not</em> automatically give paid API access.</div>
                  <div style={{ marginTop: '6px' }}>To unlock <strong style={{ color: '#fff' }}>Pro &amp; Flash models</strong> via API, enable billing separately:</div>
                  <a
                    href="https://aistudio.google.com/plan"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '5px 10px',
                      background: 'rgba(255,200,0,0.12)',
                      border: '1px solid rgba(255,200,0,0.4)',
                      borderRadius: '5px',
                      color: '#ffd60a',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.72rem'
                    }}
                  >
                    → Enable Pay-as-you-go at aistudio.google.com/plan
                  </a>
                </div>

                {/* Model ID */}
                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Model:
                  </label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-orange)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  >
                    <option value="gemini-3.1-flash-image">✅ gemini-3.1-flash-image — Nano Banana 2 (Free tier OK)</option>
                    <option value="gemini-2.5-flash-image">✅ gemini-2.5-flash-image — Nano Banana 1 (Free tier OK)</option>
                    <option value="gemini-3-pro-image">💳 gemini-3-pro-image — Nano Banana Pro (Billing required)</option>
                    <option value="gemini-3.1-flash-image-preview">💳 gemini-3.1-flash-image-preview — Preview (Billing required)</option>
                  </select>
                  <span style={{ display: 'block', fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    ✅ = works on free API tier &nbsp;|&nbsp; 💳 = requires billing enabled
                  </span>
                </div>
              </div>
            )}
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to clear all generated AI avatars?")) {
                    setAiPreviews({});
                    localStorage.removeItem('myjourney_ai_previews_v1');
                  }
                }}
                className="btn btn-secondary"
                style={{
                  padding: '8px 12px',
                  fontSize: '0.74rem',
                  borderColor: '#ff4d4d',
                  color: '#ff4d4d',
                  width: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={12} />
                Clear All AI Previews
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '12px 18px',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Visualization Model Gender:
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setGenderModel('male')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: 700,
              background: genderModel === 'male' ? 'var(--accent-orange)' : 'rgba(255,255,255,0.05)',
              color: '#fff',
              transition: 'all 0.2s',
            }}
          >
            Male Profile
          </button>
          <button
            onClick={() => setGenderModel('female')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: 700,
              background: genderModel === 'female' ? 'var(--accent-orange)' : 'rgba(255,255,255,0.05)',
              color: '#fff',
              transition: 'all 0.2s',
            }}
          >
            Female Profile
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {previewCards.map((card) => {
          const aiPhoto = aiPreviews[card.key];
          const isGenerating = generatingKey === card.key;
          
          return (
            <div key={card.key} className="journey-card" style={{
              margin: 0,
              padding: '20px',
              border: `1px solid ${aiPhoto ? 'rgba(255,255,255,0.1)' : 'var(--border-color)'}`
            }}>
              {/* Card Title info bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <span style={{
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: card.color,
                    letterSpacing: '0.06em',
                    display: 'block'
                  }}>
                    {card.type}
                  </span>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fff', margin: '2px 0 0 0' }}>
                    {card.label}
                  </h4>
                </div>
                <span style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '4px 10px',
                  borderRadius: '16px'
                }}>
                  {card.bf}
                </span>
              </div>

              {/* Side-by-side or Preview container */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                minHeight: '180px'
              }}>
                {/* Left: User's Uploaded Checkpoint photo */}
                <div style={{
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px dashed rgba(255,255,255,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {card.uploadedPhoto ? (
                    <img 
                      src={card.uploadedPhoto} 
                      alt="Uploaded view" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <Camera size={20} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
                        No photo uploaded
                      </span>
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    Before (Now)
                  </div>
                </div>

                {/* Right: AI-Generated Target / Milestone photo */}
                <div style={{
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {isGenerating ? (
                    /* Generating state with spinning animation */
                    <div style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={24} color="var(--accent-orange)" style={{ animation: 'spin-slow 1.5s linear infinite' }} />
                      <span style={{ fontSize: '0.68rem', color: 'var(--accent-orange)', fontWeight: 600 }}>
                        Running Pipeline...
                      </span>
                    </div>
                  ) : aiPhoto ? (
                    /* Render generated photo */
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <img 
                        src={aiPhoto} 
                        alt="AI avatar visualization" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={() => {
                          // Auto-clear broken cached URL so user sees the retry button
                          console.warn('AI preview image failed to load — clearing from cache:', aiPhoto.substring(0, 60));
                          const updated = { ...aiPreviews };
                          delete updated[card.key];
                          setAiPreviews(updated);
                          try {
                            localStorage.setItem('myjourney_ai_previews_v1', JSON.stringify(updated));
                          } catch {}
                        }}
                      />
                      {/* Delete / Regenerate Specific card */}
                      <button
                        onClick={() => {
                          const updated = { ...aiPreviews };
                          delete updated[card.key];
                          setAiPreviews(updated);
                          localStorage.setItem('myjourney_ai_previews_v1', JSON.stringify(updated));
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '38px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          border: 'none',
                          color: '#ff4d4d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          transition: 'all 0.2s'
                        }}
                        title="Delete / Regenerate Avatar"
                      >
                        <Trash2 size={11} />
                      </button>
                      <button
                        onClick={() => {
                          setActiveZoomUrl(aiPhoto);
                          setActiveZoomLabel(card.label);
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          border: 'none',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                        title="Maximize View"
                      >
                        <Maximize2 size={11} />
                      </button>
                    </div>
                  ) : (
                    /* Trigger generation */
                    <div style={{ padding: '20px', textAlign: 'center', width: '100%' }}>
                      <button
                        onClick={() => handleGenerateAI(card.key, card.prompt)}
                        style={{
                          background: 'rgba(255, 94, 0, 0.1)',
                          border: '1px solid var(--accent-orange)',
                          borderRadius: '8px',
                          color: 'var(--accent-orange)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '8px 14px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 94, 0, 0.18)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 94, 0, 0.1)';
                        }}
                      >
                        <Sparkles size={12} />
                        Run AI Preview
                      </button>
                      <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                        Compute transformation avatar
                      </span>
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: card.color,
                    color: '#fff',
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    After (AI Proj.)
                  </div>
                </div>
              </div>

              {/* Collapsible Prompt display to inspect what is sent */}
              <details style={{ marginTop: '12px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <summary style={{ cursor: 'pointer', outline: 'none', fontWeight: 600 }}>
                  Show API Prompt Payload
                </summary>
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  padding: '8px',
                  borderRadius: '6px',
                  marginTop: '6px',
                  fontFamily: 'monospace',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                  color: 'var(--text-secondary)'
                }}>
                  {card.prompt}
                </div>
              </details>
            </div>
          );
        })}
      </div>

      {/* Metrics Cards List */}
      <h3 className="heading-section" style={{ marginBottom: '16px', fontSize: '1.1rem' }}>
        Biometric Dashboards
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className="journey-card"
              style={{
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: `${metric.color}1a`,
                  border: `1px solid ${metric.color}4d`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: metric.color
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <h4 style={{
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--text-primary)'
                  }}>
                    {metric.name}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {metric.desc}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span style={{
                  fontSize: '1.2rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  color: 'var(--text-primary)'
                }}>
                  {metric.value}
                </span>
                
                {metric.id !== 'steps' && (
                  <button
                    onClick={() => setActiveManualMetric(metric.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-orange)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Input overlay modal */}
      {activeManualMetric && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }} onClick={() => setActiveManualMetric(null)}>
          <div className="journey-card" style={{
            width: '100%',
            maxWidth: '320px',
            backgroundColor: 'var(--bg-panel)',
            padding: '24px',
            margin: 0
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1rem',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-display)',
              marginBottom: '16px'
            }}>
              Update {activeManualMetric.toUpperCase()}
            </h3>

            <form onSubmit={handleManualSave}>
              <div className="form-group">
                <label className="form-label">New Value</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="Enter numeric value"
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveManualMetric(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '8px 0', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '8px 0', fontSize: '0.8rem' }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zoom / Lightbox Modal for AI image */}
      {activeZoomUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setActiveZoomUrl(null)}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }} onClick={(e) => e.stopPropagation()}>
            <img 
              src={activeZoomUrl} 
              alt="Zoomed preview" 
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: 'var(--shadow-lg)'
              }}
            />
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{activeZoomLabel}</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Double click to save or share image
              </p>
              <button 
                onClick={() => setActiveZoomUrl(null)}
                className="btn btn-secondary"
                style={{ width: 'auto', padding: '6px 16px', marginTop: '12px', fontSize: '0.76rem' }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyComp;
