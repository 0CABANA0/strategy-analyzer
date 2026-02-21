-- ============================================================
-- 관리자 기능 마이그레이션: 전역 앱 설정 + 회원 상태 관리
-- ============================================================

-- A. 전역 앱 설정 테이블
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
CREATE POLICY "anyone_read" ON app_settings
  FOR SELECT USING (true);

-- 관리자만 삽입 가능
CREATE POLICY "admin_insert" ON app_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- 관리자만 수정 가능
CREATE POLICY "admin_update" ON app_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- 기본 AI 모델 설정 삽입
INSERT INTO app_settings (key, value)
VALUES ('ai_model', '"google/gemini-3.1-pro-preview"')
ON CONFLICT DO NOTHING;

-- B. 프로필에 status 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- status 값 제한: 'active' 또는 'suspended'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_status_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_status_check
      CHECK (status IN ('active', 'suspended'));
  END IF;
END $$;
