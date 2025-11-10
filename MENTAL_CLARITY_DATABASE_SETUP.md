# Mental Clarity Database Setup

## Tables Required

### 1. mental_clarity_tests
Stores individual test results for each of the 5 tests.

```sql
CREATE TABLE mental_clarity_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN ('focus', 'flexibility', 'speed', 'memory', 'subjective')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  metrics JSONB NOT NULL DEFAULT '{}',
  clarity_index INTEGER,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mental_clarity_tests_user_id ON mental_clarity_tests(user_id);
CREATE INDEX idx_mental_clarity_tests_user_test_type ON mental_clarity_tests(user_id, test_type);
CREATE INDEX idx_mental_clarity_tests_timestamp ON mental_clarity_tests(timestamp);

-- RLS Policies
ALTER TABLE mental_clarity_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own test results"
  ON mental_clarity_tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test results"
  ON mental_clarity_tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test results"
  ON mental_clarity_tests FOR UPDATE
  USING (auth.uid() = user_id);
```

### 2. clarity_index
Stores daily combined clarity indices.

```sql
CREATE TABLE clarity_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_score INTEGER NOT NULL DEFAULT 0,
  flexibility_score INTEGER NOT NULL DEFAULT 0,
  speed_score INTEGER NOT NULL DEFAULT 0,
  memory_score INTEGER NOT NULL DEFAULT 0,
  subjective_score INTEGER NOT NULL DEFAULT 0,
  combined_score INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX idx_clarity_index_user_id ON clarity_index(user_id);
CREATE INDEX idx_clarity_index_date ON clarity_index(date);
CREATE INDEX idx_clarity_index_user_date ON clarity_index(user_id, date);

-- RLS Policies
ALTER TABLE clarity_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clarity index"
  ON clarity_index FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clarity index"
  ON clarity_index FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clarity index"
  ON clarity_index FOR UPDATE
  USING (auth.uid() = user_id);
```

### 3. Functions for automatic updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mental_clarity_tests_updated_at
  BEFORE UPDATE ON mental_clarity_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clarity_index_updated_at
  BEFORE UPDATE ON clarity_index
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Metrics JSON Schema

### Focus Test Metrics
```json
{
  "correctTaps": 28,
  "missedTargets": 2,
  "falseTaps": 1,
  "avgReactionTime": 485,
  "focusAccuracy": 93.3
}
```

### Flexibility Test Metrics
```json
{
  "switchReactionTime": 650,
  "accuracyBefore": 95,
  "accuracyAfter": 88,
  "switchCost": 155,
  "errorRate": 7
}
```

### Speed Test Metrics
```json
{
  "speedCorrectMatches": 33,
  "incorrectMatches": 2,
  "totalAttempts": 35
}
```

### Memory Test Metrics
```json
{
  "memoryCorrectMatches": 15,
  "falsePositives": 2,
  "nLevel": 2,
  "memoryAccuracy": 88.2
}
```

### Subjective Test Metrics
```json
{
  "mentalFog": 20,
  "concentration": 80,
  "energy": 75
}
```

## Setup Instructions

1. Run the SQL commands above in your Supabase SQL editor
2. Verify tables are created with proper RLS policies
3. Test insert/select with authenticated user
4. The app will automatically start storing data once tables exist

## Integration Points

- **Mood Logging**: Correlate clarity scores with daily mood
- **Sleep Data**: Link sleep quality to mental performance
- **Habit Tracking**: Identify habits that improve clarity
- **AI Insights**: Generate personalized recommendations
- **Dashboard**: Display trends and progress over time
