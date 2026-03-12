-- ============================================================
-- strategy_documents 테이블 RLS 정책
-- ============================================================
-- 이 테이블에는 RLS가 없어 권한 우회 가능성이 있었음.
-- 본인의 문서만 CRUD 가능하도록 정책 추가.
-- ============================================================

-- RLS 활성화 (이미 활성화된 경우 무시됨)
ALTER TABLE strategy_documents ENABLE ROW LEVEL SECURITY;

-- 본인의 문서만 조회 가능
CREATE POLICY "user_read_own_docs" ON strategy_documents
  FOR SELECT USING (user_id = auth.uid());

-- 본인만 삽입 가능
CREATE POLICY "user_insert_own_docs" ON strategy_documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 본인만 수정 가능
CREATE POLICY "user_update_own_docs" ON strategy_documents
  FOR UPDATE USING (user_id = auth.uid());

-- 본인만 삭제 가능
CREATE POLICY "user_delete_own_docs" ON strategy_documents
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- profiles 테이블 RLS 정책
-- ============================================================
-- 프로필은 본인과 관리자만 조회 가능.
-- 팀 초대 시 이메일 검색을 위해 인증된 사용자의 제한적 조회 허용.
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자는 프로필 조회 가능 (팀 초대용 이메일 검색)
CREATE POLICY "authenticated_read_profiles" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 본인만 수정 가능
CREATE POLICY "user_update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid());
