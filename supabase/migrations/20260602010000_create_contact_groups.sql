-- Contact groups for email distribution lists
CREATE TABLE IF NOT EXISTS contact_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES contact_groups(id) ON DELETE CASCADE NOT NULL,
  contact_email TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, contact_email)
);

-- RLS
ALTER TABLE contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage groups"
  ON contact_groups FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'service_role'));

CREATE POLICY "Admins can manage group members"
  ON contact_group_members FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'service_role'));
