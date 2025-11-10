# Intimacy Hub Database Setup

This document outlines the database schema for the comprehensive Intimacy Hub feature.

## Database Tables

### 1. `intimacy_check_ins`
Daily emotional and relational tracking.

```sql
CREATE TABLE intimacy_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 10),
  stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND mood <= 10),
  connection_self INTEGER NOT NULL CHECK (connection_self >= 1 AND connection_self <= 10),
  connection_partner INTEGER CHECK (connection_partner >= 1 AND connection_partner <= 10),
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  intimacy_frequency INTEGER CHECK (intimacy_frequency >= 0),
  intimacy_quality INTEGER CHECK (intimacy_quality >= 1 AND intimacy_quality <= 10),
  emotional_distance BOOLEAN DEFAULT FALSE,
  what_made_close TEXT,
  what_appreciated TEXT,
  notes TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, date),
  CONSTRAINT check_ins_user_date_idx UNIQUE (user_id, date)
);

CREATE INDEX idx_intimacy_checkins_user_date ON intimacy_check_ins(user_id, date DESC);
```

### 2. `intimacy_programs`
Structured coaching programs.

```sql
CREATE TABLE intimacy_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  target_end_date DATE,
  current_lesson INTEGER DEFAULT 1,
  total_lessons INTEGER NOT NULL,
  pace TEXT DEFAULT 'daily' CHECK (pace IN ('daily', 'custom')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intimacy_programs_user_status ON intimacy_programs(user_id, status);
```

### 3. `program_lessons`
Individual lessons within programs.

```sql
CREATE TABLE program_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES intimacy_programs(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  action_item TEXT,
  practice_timeline TEXT,
  reminder_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_note TEXT,
  
  UNIQUE(program_id, lesson_number)
);

CREATE INDEX idx_program_lessons_program ON program_lessons(program_id, lesson_number);
```

### 4. `intimacy_experiments`
Behavioral experiments and tracking.

```sql
CREATE TABLE intimacy_experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  hypothesis TEXT,
  duration_days INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  parameters_tracked TEXT[] NOT NULL,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'alternate')),
  reminder_time TIME,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  completion_rate NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intimacy_experiments_user_status ON intimacy_experiments(user_id, status);
```

### 5. `experiment_logs`
Daily logs for experiments.

```sql
CREATE TABLE experiment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES intimacy_experiments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
  connection_after INTEGER CHECK (connection_after >= 1 AND connection_after <= 10),
  stress_after INTEGER CHECK (stress_after >= 1 AND stress_after <= 10),
  satisfaction_after INTEGER CHECK (satisfaction_after >= 1 AND satisfaction_after <= 10),
  communication_after INTEGER CHECK (communication_after >= 1 AND communication_after <= 10),
  notes TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(experiment_id, date)
);

CREATE INDEX idx_experiment_logs_experiment_date ON experiment_logs(experiment_id, date DESC);
```

### 6. `connection_scores`
Calculated daily connection scores.

```sql
CREATE TABLE connection_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  mood_contribution NUMERIC(5,2),
  intimacy_contribution NUMERIC(5,2),
  communication_contribution NUMERIC(5,2),
  stress_penalty NUMERIC(5,2),
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_connection_scores_user_date ON connection_scores(user_id, date DESC);
```

### 7. `intimacy_assessments`
Periodic self-assessments.

```sql
CREATE TABLE intimacy_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  metrics JSONB,
  date DATE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intimacy_assessments_user_type ON intimacy_assessments(user_id, assessment_type, date DESC);
```

## Row Level Security (RLS)

Enable RLS on all tables:

```sql
ALTER TABLE intimacy_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE intimacy_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE intimacy_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE intimacy_assessments ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
-- intimacy_check_ins
CREATE POLICY "Users can view their own check-ins"
  ON intimacy_check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own check-ins"
  ON intimacy_check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins"
  ON intimacy_check_ins FOR UPDATE
  USING (auth.uid() = user_id);

-- intimacy_programs
CREATE POLICY "Users can view their own programs"
  ON intimacy_programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own programs"
  ON intimacy_programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own programs"
  ON intimacy_programs FOR UPDATE
  USING (auth.uid() = user_id);

-- program_lessons (access through parent program)
CREATE POLICY "Users can view lessons of their programs"
  ON program_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM intimacy_programs
      WHERE intimacy_programs.id = program_lessons.program_id
      AND intimacy_programs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert lessons for their programs"
  ON program_lessons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM intimacy_programs
      WHERE intimacy_programs.id = program_lessons.program_id
      AND intimacy_programs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update lessons of their programs"
  ON program_lessons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM intimacy_programs
      WHERE intimacy_programs.id = program_lessons.program_id
      AND intimacy_programs.user_id = auth.uid()
    )
  );

-- intimacy_experiments
CREATE POLICY "Users can view their own experiments"
  ON intimacy_experiments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own experiments"
  ON intimacy_experiments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiments"
  ON intimacy_experiments FOR UPDATE
  USING (auth.uid() = user_id);

-- experiment_logs
CREATE POLICY "Users can view logs of their experiments"
  ON experiment_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM intimacy_experiments
      WHERE intimacy_experiments.id = experiment_logs.experiment_id
      AND intimacy_experiments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert logs for their experiments"
  ON experiment_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM intimacy_experiments
      WHERE intimacy_experiments.id = experiment_logs.experiment_id
      AND intimacy_experiments.user_id = auth.uid()
    )
  );

-- connection_scores
CREATE POLICY "Users can view their own connection scores"
  ON connection_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connection scores"
  ON connection_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connection scores"
  ON connection_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- intimacy_assessments
CREATE POLICY "Users can view their own assessments"
  ON intimacy_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
  ON intimacy_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Functions & Triggers

### Auto-update timestamp trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_intimacy_programs_updated_at BEFORE UPDATE
    ON intimacy_programs FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
```

## Sample Data Structures

### Example Check-In
```json
{
  "user_id": "uuid",
  "date": "2025-11-09",
  "mood": 8,
  "stress_level": 4,
  "connection_self": 7,
  "connection_partner": 8,
  "energy_level": 7,
  "intimacy_quality": 9,
  "what_made_close": "Quality time together in the evening",
  "what_appreciated": "Partner listening to my work stress",
  "notes": "Great day overall"
}
```

### Example Experiment Metrics
```json
{
  "experiment_id": "uuid",
  "parameters_tracked": ["mood", "connection", "stress", "satisfaction"],
  "before_avg": {"mood": 6.5, "connection": 5.8},
  "after_avg": {"mood": 7.8, "connection": 7.2},
  "improvement": {"mood": "+20%", "connection": "+24%"}
}
```

## Deployment Steps

1. Run all CREATE TABLE statements in Supabase SQL Editor
2. Enable RLS on all tables
3. Create all RLS policies
4. Create indexes for performance
5. Add triggers for auto-updates
6. Test with sample data

## Security Notes

- All tables use RLS to ensure user data isolation
- Timestamps use TIMESTAMPTZ for timezone awareness
- Constraints ensure data validity (ratings 1-10)
- Cascade deletes maintain referential integrity
- No cross-user data access possible
