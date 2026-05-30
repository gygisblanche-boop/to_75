import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { HabitKeys } from '../context/AppContext';
import { Flame, Check, Sparkles, Upload, FileText } from 'lucide-react';

export const HabitLog: React.FC = () => {
  const {
    habits,
    meals,
    currentStreak,
    toggleHabit,
    logMealText,
    logMealImage,
    getTodayDateString
  } = useApp();

  const today = getTodayDateString();
  const todayHabits = habits[today] || {
    wakeUp: false,
    hydration: false,
    eatClean: false,
    avoidJunk: false,
    sleepOnTime: false,
  };
  
  const todayMeal = meals[today] || { log: '', image: '' };
  
  const [mealText, setMealText] = useState(todayMeal.log);
  const [visionAnalysis, setVisionAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // List of habits to render
  const habitItems: { key: HabitKeys; label: string; desc: string }[] = [
    { key: 'wakeUp', label: 'Wake Up Early', desc: 'Out of bed before 7:00 AM' },
    { key: 'hydration', label: 'Hydration (3L)', desc: 'Logged 3000ml of water intake' },
    { key: 'eatClean', label: 'Eat Clean', desc: 'Whole foods, lean proteins, high fiber' },
    { key: 'avoidJunk', label: 'Avoid Junk', desc: 'No processed sugars or refined carbs' },
    { key: 'sleepOnTime', label: 'Sleep on Time', desc: 'Resting before 10:30 PM (Auto-synced)' },
  ];

  // Generate list of the last 7 calendar days
  const getLast7Days = () => {
    const days = [];
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      // Check if all habits done for this day
      const dayRecord = habits[dateStr];
      const isComplete = dayRecord ? (
        dayRecord.wakeUp &&
        dayRecord.hydration &&
        dayRecord.eatClean &&
        dayRecord.avoidJunk &&
        dayRecord.sleepOnTime
      ) : false;

      // Count checked habits
      const checkedCount = dayRecord ? Object.values(dayRecord).filter(Boolean).length : 0;

      days.push({
        dateStr,
        dayNum: d.getDate(),
        dayName: weekdayNames[d.getDay()],
        isComplete,
        checkedCount,
      });
    }
    return days;
  };

  const calendarDays = getLast7Days();

  // Save meal log
  const handleSaveMealLog = (e: React.FormEvent) => {
    e.preventDefault();
    logMealText(today, mealText);
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          logMealImage(today, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulated Gemini Vision scan
  const handleGeminiVisionScan = () => {
    if (!todayMeal.image) return;
    setIsAnalyzing(true);
    setVisionAnalysis('');

    setTimeout(() => {
      const analysisOutputs = [
        "Gemini Vision Analysis: Detected Grilled Salmon, Sweet Potato, and Steamed Broccoli. Estimated nutrition: 520 kcal, 42g Protein, 14g healthy Fats, 48g Complex Carbs. Clean Fuel verified!",
        "Gemini Vision Analysis: Detected Avocado Sourdough toast with 2 poached eggs. Estimated nutrition: 460 kcal, 22g Protein, 24g healthy Fats, 38g Complex Carbs. Clean Fuel verified!",
        "Gemini Vision Analysis: Detected Chicken breast salad with mixed greens, olive oil, and almonds. Estimated nutrition: 390 kcal, 38g Protein, 18g Fats, 12g Carbs. Perfect low-carb fuel!",
      ];
      
      setVisionAnalysis(analysisOutputs[Math.floor(Math.random() * analysisOutputs.length)]);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="anim-fade-up">
      {/* Streak Dashboard Card */}
      <div className="journey-card glow-orange" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Habit Streak Machine
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Flame size={24} color="var(--accent-orange)" style={{ filter: 'var(--glow-orange-filter)' }} />
            {currentStreak} Day Streak
          </h2>
        </div>
        <div style={{
          fontSize: '0.7rem',
          backgroundColor: 'rgba(255, 94, 0, 0.1)',
          border: '1px solid var(--accent-orange)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          color: 'var(--accent-orange)',
          fontWeight: 700,
          textTransform: 'uppercase',
          textAlign: 'right'
        }}>
          All 5 = sticker
        </div>
      </div>

      {/* 7-Day Duolingo-style sticker calendar grid */}
      <div className="journey-card" style={{ padding: '16px 12px' }}>
        <h3 className="heading-section" style={{ fontSize: '1rem', marginBottom: '14px' }}>
          Sticker Calendar (Last 7 Days)
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
        }}>
          {calendarDays.map((day) => {
            const isToday = day.dateStr === today;
            return (
              <div
                key={day.dateStr}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {/* Sticker slot */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: day.isComplete
                      ? 'var(--accent-orange)'
                      : isToday
                      ? 'rgba(255,255,255,0.05)'
                      : 'var(--bg-dark)',
                    border: day.isComplete
                      ? 'none'
                      : isToday
                      ? '2px dashed var(--accent-orange)'
                      : '1px solid var(--border-color)',
                    boxShadow: day.isComplete
                      ? '0 0 12px var(--accent-orange-glow)'
                      : 'none',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                  title={day.isComplete ? 'Habit Goal Met!' : `${day.checkedCount}/5 complete`}
                >
                  {day.isComplete ? (
                    <Flame size={20} color="var(--text-primary)" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                  ) : (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isToday ? 'var(--accent-orange)' : 'var(--text-muted)'
                    }}>
                      {day.checkedCount}/5
                    </span>
                  )}
                </div>
                {/* Date labels */}
                <span style={{
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: isToday ? 800 : 500,
                  color: isToday ? 'var(--accent-orange)' : 'var(--text-secondary)',
                  textTransform: 'uppercase'
                }}>
                  {day.dayName}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: isToday ? 800 : 600,
                  color: isToday ? 'var(--text-primary)' : 'var(--text-muted)',
                  marginTop: '-4px'
                }}>
                  {day.dayNum}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Habits Checklist */}
      <div className="journey-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="heading-section" style={{ fontSize: '1.1rem' }}>
            Daily Habit Protocol
          </h3>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--accent-green)',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            +10 XP / Habit
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {habitItems.map((habit) => {
            const isChecked = todayHabits[habit.key];
            return (
              <div
                key={habit.key}
                onClick={() => toggleHabit(today, habit.key)}
                className={`journey-card ${isChecked ? 'glow-green' : ''}`}
                style={{
                  margin: 0,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: isChecked ? 'rgba(57, 255, 20, 0.03)' : 'var(--bg-card)',
                  borderColor: isChecked ? 'var(--accent-green-dark)' : 'var(--border-color)',
                }}
              >
                <div>
                  <h4 style={{
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-display)',
                    color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}>
                    {habit.label}
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {habit.desc}
                  </p>
                </div>

                {/* Custom Checkbox circle */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isChecked ? 'var(--accent-green-dark)' : 'rgba(0,0,0,0.3)',
                  border: isChecked ? 'none' : '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  {isChecked && <Check size={14} color="var(--bg-dark)" strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meal Logger */}
      <div className="journey-card">
        <h3 className="heading-section" style={{ fontSize: '1.1rem', marginBottom: '14px' }}>
          Nutrition & Meal Logger
        </h3>

        <form onSubmit={handleSaveMealLog} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Daily Food Diary</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="e.g. Breakfast: 3 scrambled eggs, spinach, coffee. Lunch: Grilled chicken, white rice, avocado."
              value={mealText}
              onChange={(e) => setMealText(e.target.value)}
              style={{ resize: 'none', fontSize: '0.9rem' }}
            />
          </div>

          {/* Attachment Preview */}
          {todayMeal.image && (
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              marginTop: '6px'
            }}>
              <img
                src={todayMeal.image}
                alt="Meal Upload"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => logMealImage(today, '')}
                className="btn-icon"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  borderColor: 'rgba(255,255,255,0.2)'
                }}
              >
                X
              </button>
            </div>
          )}

          {/* Image Upload triggers */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <label
              className="btn btn-secondary"
              style={{
                flex: 1,
                fontSize: '0.78rem',
                padding: '10px 0',
                cursor: 'pointer',
                margin: 0
              }}
            >
              <Upload size={14} /> Photo Attachment
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            
            {todayMeal.image && (
              <button
                type="button"
                onClick={handleGeminiVisionScan}
                disabled={isAnalyzing}
                className="btn btn-primary"
                style={{ flex: 1, fontSize: '0.78rem', padding: '10px 0' }}
              >
                <Sparkles size={14} /> Scan with AI
              </button>
            )}
          </div>

          <button type="submit" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '10px 0' }}>
            <FileText size={14} /> Save Text Logs
          </button>
        </form>

        {/* Gemini Vision Scan details */}
        {isAnalyzing && (
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--accent-orange)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            marginTop: '16px',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)'
          }}>
            Connecting to Gemini Vision API... Analyzing plate composition...
          </div>
        )}

        {visionAnalysis && (
          <div style={{
            backgroundColor: 'rgba(0, 230, 118, 0.05)',
            border: '1px solid var(--accent-green-dark)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginTop: '16px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <Sparkles size={18} color="var(--accent-green-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {visionAnalysis}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitLog;
