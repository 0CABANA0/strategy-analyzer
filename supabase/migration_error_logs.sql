-- error_logs 테이블: 클라이언트 에러 기록
-- 적용: Supabase Dashboard → SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS error_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  level text NOT NULL DEFAULT 'error' CHECK (level IN ('error', 'warn')),
  message text NOT NULL,
  stack text,
  context jsonb,
  url text,
  user_agent text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 인덱스: 최근 에러 조회 + 사용자별 조회
CREATE INDEX idx_error_logs_created_at ON error_logs (created_at DESC);
CREATE INDEX idx_error_logs_user_id ON error_logs (user_id);

-- RLS: 인증된 사용자만 INSERT 가능, SELECT는 관리자만
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_error_logs"
  ON error_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 관리자 조회 정책 (app_settings의 관리자 이메일과 비교)
-- 관리자만 에러 로그를 조회할 수 있음
CREATE POLICY "admin_read_error_logs"
  ON error_logs FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN (
        SELECT unnest(string_to_array(
          (SELECT value->>'admin_emails' FROM app_settings WHERE key = 'global'),
          ','
        ))
      )
    )
  );

-- 30일 이상 된 로그 자동 삭제 (pg_cron 사용 시)
-- SELECT cron.schedule('cleanup-error-logs', '0 3 * * *', $$DELETE FROM error_logs WHERE created_at < now() - interval '30 days'$$);
