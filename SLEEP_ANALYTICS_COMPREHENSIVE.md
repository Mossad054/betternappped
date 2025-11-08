# Sleep Analytics - Comprehensive Data-Driven Insights

## Overview

The Sleep Analytics system transforms basic sleep tracking into a powerful, data-driven insights engine that helps users understand their sleep patterns, identify what affects their sleep, and receive personalized, evidence-based recommendations.

---

## 🎯 Key Features

### 1. **Advanced Pattern Detection**
- **Weekday vs Weekend Analysis**: Detects sleep debt accumulation and "social jet lag"
- **Quality Decline Patterns**: Identifies weekly fatigue trends
- **Late Bedtime Patterns**: Correlates bedtime with quality outcomes
- **Optimal Window Detection**: Finds user's personal best bedtime based on quality data
- **Duration-Quality Correlation**: Discovers each user's sleep duration sweet spot

### 2. **Intelligent Correlations**
- **Bedtime Consistency Impact**: Quantifies how consistency affects quality
- **Weekend Effect Analysis**: Compares weekday vs weekend sleep patterns
- **Duration-Quality Relationship**: Statistical correlation analysis with confidence scores
- **Strength Metrics**: 0-100% correlation strength with visual indicators

### 3. **Personalized Recommendations**
- **Priority-Based**: High/Medium/Low priority with color coding
- **Category-Specific**: Duration, Quality, Consistency, Environment, Habits
- **Evidence-Based**: Each recommendation includes:
  - Clear rationale with scientific backing
  - Step-by-step action items
  - Estimated impact timeline
  - Related habit suggestions
- **Dynamic**: Recommendations change based on current data patterns

### 4. **Comprehensive Metrics**
- **Sleep Efficiency Score**: 0-100 composite metric (duration 25%, quality 35%, consistency 25%, debt 15%)
- **Average Duration**: With trend indicator (improving/declining/stable)
- **Average Quality**: 1-5 scale with trend
- **Consistency Score**: Bedtime variance analysis
- **Sleep Debt Tracking**: Cumulative hours below optimal
- **Optimal Bedtime Window**: Data-driven personal recommendation

---

## 📊 Analytics Engine Architecture

### SleepAnalyticsService

#### Core Methods

**`generateDetailedInsights(userId, days)`**
- Main entry point for comprehensive analysis
- Returns: `DetailedInsights` object with all metrics, patterns, correlations, and recommendations
- Default: 30-day analysis period (configurable: 30, 60, 90 days)

**`calculateMetrics(logs)`**
- Computes all core metrics
- Analyzes trends using moving averages
- Identifies optimal bedtime windows based on quality

**`detectPatterns(logs)`**
- Pattern recognition algorithms
- Confidence scores (0-100%) for each pattern
- Severity levels: positive, neutral, warning, critical

**`analyzeCorrelations(userId, logs)`**
- Statistical correlation analysis
- Pearson correlation coefficient calculation
- Strength metrics with impact assessment

**`generateRecommendations(logs, metrics, patterns, correlations)`**
- AI-driven recommendation engine
- Context-aware suggestions
- Prioritization algorithm
- Actionable step generation

---

## 🎨 UI Components

### Trends Screen Features

#### 1. **Period Selector**
```
[30 Days] [90 Days]
```
- Toggle between analysis periods
- Real-time data refresh

#### 2. **Sleep Efficiency Hero Card**
```
┌─────────────────────────────────┐
│  🏆  Sleep Efficiency           │
│      89%                        │
│      Excellent!                 │
└─────────────────────────────────┘
```
- Large, prominent display
- Visual status indicator
- Color-coded performance

#### 3. **Key Metrics Grid**
```
┌──────┬──────┬──────┐
│ 7.5h │ 4.2  │ 85%  │
│ Avg  │ Avg  │ Con- │
│ Dur  │ Qual │ sist │
└──────┴──────┴──────┘
```
- Trend arrows for each metric
- At-a-glance overview

#### 4. **Sleep Debt Alert** (Conditional)
```
⚠️ Sleep Debt Alert
You have accumulated 12.5 hours of sleep debt.
This can impact health, mood, and cognitive
performance.
```
- Only shows when debt > 5 hours
- Red warning styling

#### 5. **Duration Chart**
```
┌─────────────────────────────────┐
│ Sleep Duration Trend            │
│ Last 14 nights • Color=Quality │
│                                 │
│  ▮                              │
│  ▮  ▮     ▮  ▮                  │
│  ▮  ▮  ▮  ▮  ▮  ▮               │
│  M  T  W  T  F  S  S  M  T  ... │
└─────────────────────────────────┘
Legend: 🟢 High 🟡 Medium 🔴 Low
```
- 14-day bar chart
- Color-coded by quality
- Hour values on bars

#### 6. **Weekday vs Weekend Comparison**
```
┌─────────────────────────────────┐
│  Weekdays        │   Weekends   │
│    7.2h          │     8.5h     │
│ Quality: 3.8/5   │ Quality: 4.2 │
└─────────────────────────────────┘

💡 You sleep 1.3 hours more on weekends,
   indicating weekday sleep debt...
```

#### 7. **Optimal Bedtime Card**
```
🎯 Your Optimal Bedtime
   22:00 - 23:00
   Based on your highest quality
   sleep nights
```

#### 8. **Detected Patterns**
- Expandable cards
- Confidence percentage
- Severity color coding
- Detailed descriptions

```
📅 Weekday vs Weekend Pattern [85%]
You sleep 1.5 hours more on weekends
(8.5h) compared to weekdays (7.0h).
This indicates potential sleep debt...
```

#### 9. **Correlations**
```
Bedtime Consistency  [↑ 75%]
Consistent bedtimes (±1 hour) correlate
with 0.8 points higher sleep quality.

💡 Maintain consistent bedtimes within
   a 1-hour window, even on weekends.
```

#### 10. **Personalized Recommendations**
```
⚠️ HIGH PRIORITY | DURATION
Increase Sleep Duration

You're averaging 6.2 hours - below the
recommended 7-9 hours.

[Expand for action steps ▼]

  Why this matters:
  With a current sleep debt of 8.5 hours,
  you're at risk of impaired cognitive
  function...

  Action Steps:
  1. Move bedtime 15 minutes earlier each
     week until reaching 22:00
  2. Set a bedtime alarm 30 minutes before
     target sleep time
  3. Eliminate screen time 1 hour before bed
  4. Create a wind-down routine

  ⚡ Reaching 7-8 hours can improve
     alertness by 25% and mood by 30%
     within 2 weeks

  [Browse Related Habits →]
```

---

## 📈 Data Analysis Algorithms

### Pattern Detection

**1. Weekday vs Weekend Pattern**
```typescript
Threshold: ≥1 hour difference
Severity:
  - Warning: >2 hours difference
  - Neutral: 1.5-2 hours
  - Positive: <1.5 hours
Confidence: 85%
```

**2. Quality Decline Pattern**
```typescript
Analysis: First 3 days vs Last 3 days of week
Threshold: ≥0.5 point decline
Severity:
  - Warning: >1 point decline
  - Neutral: 0.5-1 point
Confidence: 70%
```

**3. Late Bedtime Pattern**
```typescript
Definition: Bedtime ≥11 PM or <6 AM
Threshold: ≥40% of nights
Compares: Late bedtime quality vs Early
Confidence: 75%
```

**4. Optimal Window Pattern**
```typescript
Method: Find hour with highest avg quality
Min samples: 3 nights
Improvement: Compares window quality to overall
Threshold: ≥5% improvement
Confidence: 80%
```

**5. Duration-Quality Correlation**
```typescript
Ranges:
  - Short: <6.5 hours
  - Optimal: 6.5-8.5 hours
  - Long: >8.5 hours
Analysis: Quality comparison across ranges
Confidence: 75%
```

### Correlation Analysis

**Bedtime Consistency**
```typescript
Method: Weekly variance analysis
Consistent: <60 minutes variance
Compares: Consistent weeks vs Inconsistent
Strength: |quality difference| / 2
Threshold: ≥0.3 point difference
```

**Duration-Quality Correlation**
```typescript
Method: Pearson correlation coefficient
Formula: covariance / (stdDev1 * stdDev2)
Strength: |r| value
Significance: ≥0.3 correlation
```

### Recommendation Priority

**High Priority (Red ⚠️)**
- Average duration <7 hours
- Quality trend declining
- Consistency score <60%
- Strong negative correlations (>50%)

**Medium Priority (Yellow ℹ️)**
- Weekday/weekend gap >1.5 hours
- Consistency score 60-80%
- Optimal window hit <50%

**Low Priority (Blue 💡)**
- Fine-tuning suggestions
- Positive pattern reinforcement
- Maintenance recommendations

---

## 🔬 Scientific Backing

### Sleep Duration Recommendations
- **7-9 hours**: National Sleep Foundation guidelines
- **Sleep debt**: Cumulative effect on cognitive performance (Walker, 2017)
- **Weekend catch-up**: "Social jet lag" research (Wittmann et al., 2006)

### Consistency Impact
- **Circadian rhythm**: Regular sleep-wake times improve quality (Monk et al., 2003)
- **Variance**: Each 1-hour variance associated with decreased quality

### Quality Metrics
- **Self-reported quality**: Valid indicator when tracked consistently
- **5-point scale**: Optimal balance between granularity and ease of use

---

## 💡 User Benefits

### Awareness
- **Pattern Recognition**: "I didn't realize I sleep 2 hours less on weekdays!"
- **Correlation Discovery**: "Late bedtimes really do affect my quality"
- **Trend Tracking**: "My sleep has been declining this month"

### Actionability
- **Specific Steps**: Not just "sleep better" but "move bedtime 15 min earlier"
- **Prioritization**: Focus on highest-impact changes first
- **Progress Tracking**: See improvements reflected in efficiency score

### Motivation
- **Visual Progress**: Charts show improvements over time
- **Gamification**: Efficiency score provides clear goal
- **Positive Reinforcement**: Celebrates patterns that work
- **Evidence-Based**: Users trust data-driven recommendations

---

## 🚀 Future Enhancements

### Phase 2
- [ ] Habit correlation analysis (integrate with habit tracker)
- [ ] Environmental factor tracking (temperature, noise, light)
- [ ] Predictive alerts ("You're heading for a quality decline")
- [ ] Weekly email reports

### Phase 3
- [ ] Machine learning pattern detection
- [ ] Peer comparison (anonymous, aggregated)
- [ ] Sleep coaching integration
- [ ] Wearable device integration

### Phase 4
- [ ] Advanced statistics (moving averages, seasonal trends)
- [ ] Export to CSV/PDF
- [ ] Share insights with healthcare providers
- [ ] Integration with mental clarity tests and intimacy tracking

---

## 🎯 Success Metrics

### User Engagement
- **Trends View Rate**: Target 60% of active users weekly
- **Recommendation Action Rate**: Target 40% act on at least one recommendation
- **Return Rate**: Users checking trends 2+ times per week

### Sleep Improvements
- **Efficiency Score**: Average increase of 10-15 points over 30 days
- **Consistency**: 20% improvement in consistency score
- **Duration**: 15% of users reach 7+ hour average

### Feature Utilization
- **Pattern Exploration**: 70% expand at least one pattern
- **Correlation Review**: 60% read correlation insights
- **Habit Integration**: 30% navigate to habit library from recommendations

---

## 📱 Implementation Notes

### Performance
- **Calculations**: Run on-device, <100ms for 90-day analysis
- **Caching**: Results cached for 1 hour
- **Background**: Can pre-calculate during sleep log submission

### Data Requirements
- **Minimum**: 3 days for basic insights
- **Optimal**: 14+ days for reliable patterns
- **Full Analysis**: 30+ days for all features

### Privacy
- **Local Processing**: All analysis done on-device
- **No Cloud AI**: No data sent to external services
- **User Control**: Can clear all data anytime

---

## 🎨 Design Principles

1. **Data-Driven**: Every insight backed by user's actual data
2. **Actionable**: Never show a problem without a solution
3. **Progressive Disclosure**: Overview first, details on demand
4. **Visual Hierarchy**: Most important insights most prominent
5. **Encouraging**: Positive framing, celebrate wins
6. **Transparent**: Show confidence levels, explain calculations
7. **Personalized**: Recommendations unique to each user's patterns

---

## 📚 Related Documentation

- `SLEEP_TRACKING_IMPLEMENTATION.md` - Base tracking features
- `sleep.md` - Original sleep wellness hub specification
- `services/sleep-analytics.service.ts` - Analytics engine source
- `app/sleep-wellness/trends.tsx` - UI implementation

---

*Last Updated: November 8, 2025*
*Version: 1.0*
*Feature Status: Complete ✅*
