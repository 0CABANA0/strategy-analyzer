-- ============================================================
-- 공유 링크 + 팀 워크스페이스 마이그레이션
-- ============================================================

-- ============================================================
-- A. 공유 문서 테이블 (shared_documents)
-- ============================================================
CREATE TABLE IF NOT EXISTS shared_documents (
  share_id TEXT PRIMARY KEY,
  document_id UUID NOT NULL,
  document_snapshot JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

ALTER TABLE shared_documents ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능 (공유 링크는 퍼블릭)
CREATE POLICY "anyone_read_shared" ON shared_documents
  FOR SELECT USING (true);

-- 인증된 사용자만 생성 가능
CREATE POLICY "authenticated_insert_shared" ON shared_documents
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 생성자만 삭제 가능
CREATE POLICY "owner_delete_shared" ON shared_documents
  FOR DELETE USING (created_by = auth.uid());

-- ============================================================
-- B. 팀 테이블 (teams)
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 팀 멤버만 조회 가능
CREATE POLICY "member_read_team" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
        AND team_members.user_id = auth.uid()
    )
  );

-- 인증된 사용자가 팀 생성 가능
CREATE POLICY "authenticated_create_team" ON teams
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 팀 소유자만 수정 가능
CREATE POLICY "owner_update_team" ON teams
  FOR UPDATE USING (created_by = auth.uid());

-- ============================================================
-- C. 팀 멤버 테이블 (team_members)
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 같은 팀 멤버끼리 조회 가능
CREATE POLICY "member_read_members" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
    )
  );

-- 팀 소유자만 멤버 추가 가능
CREATE POLICY "owner_insert_member" ON team_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'owner'
    )
    OR
    -- 팀 생성 시 본인을 owner로 추가하는 경우
    (team_members.user_id = auth.uid() AND team_members.role = 'owner')
  );

-- 팀 소유자만 멤버 제거 가능
CREATE POLICY "owner_delete_member" ON team_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'owner'
    )
  );

-- ============================================================
-- D. 팀 문서 테이블 (team_documents)
-- ============================================================
CREATE TABLE IF NOT EXISTS team_documents (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  document_id UUID NOT NULL,
  shared_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (team_id, document_id)
);

ALTER TABLE team_documents ENABLE ROW LEVEL SECURITY;

-- 팀 멤버만 조회 가능
CREATE POLICY "member_read_docs" ON team_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_documents.team_id
        AND team_members.user_id = auth.uid()
    )
  );

-- 팀 멤버만 문서 공유 가능
CREATE POLICY "member_share_doc" ON team_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_documents.team_id
        AND team_members.user_id = auth.uid()
    )
  );

-- 팀 소유자만 문서 공유 해제 가능
CREATE POLICY "owner_unshare_doc" ON team_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_documents.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role = 'owner'
    )
  );
