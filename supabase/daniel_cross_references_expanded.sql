create table if not exists public.daniel_cross_references_expanded (
  id text primary key,
  daniel_chapter integer not null,
  daniel_verse integer not null,
  target_book text not null,
  target_chapter integer not null,
  target_verse_start integer not null,
  target_verse_end integer,
  note text
);

create index if not exists daniel_cross_references_expanded_lookup_idx
  on public.daniel_cross_references_expanded (daniel_chapter, daniel_verse);

alter table public.daniel_cross_references_expanded enable row level security;

drop policy if exists "Allow anon read access to Daniel cross references" on public.daniel_cross_references_expanded;
create policy "Allow anon read access to Daniel cross references"
on public.daniel_cross_references_expanded
for select
to anon
using (true);
