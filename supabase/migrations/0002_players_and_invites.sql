-- v0.1 "Tap In": players, invites and the crew count.
-- Player data is built to last: later versions add columns and tables, they never rebuild these.
-- Brought over from Clout City NYC (its 0001, 0014 usernames and 0049 hardening) with the
-- Hollywood artist fields: scene, instrument, band name and fame.

-- ---------------------------------------------------------------------------
-- Players: one row per signed-up account, created when the player claims a name.
-- The creator (v0.1 step 4) fills in the Look and the Sound step (scene, instrument, band).
-- ---------------------------------------------------------------------------
create table public.players (
  id               uuid primary key references auth.users (id) on delete cascade,
  display_name     text not null,
  look             jsonb not null default '{}'::jsonb,
  -- Sound step (Clarifications 1, 3b). Null until the player picks.
  scene            text,
  instrument       text,
  band_name        text,
  invite_code      text not null unique,
  age_confirmed_at timestamptz not null,
  -- Which creator steps are done: name_done, look_done, sound_done; v0.2 adds lottery_done and home_done.
  onboarding_step  text not null default 'name_done',
  -- Fame is the score (shown as "—" until v0.2 turns shows on).
  fame             bigint not null default 0,
  music_muted      boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint players_name_format check (display_name ~ '^[A-Za-z0-9_.]{3,20}$'),
  constraint players_scene check (scene is null or scene in (
    'garage_rocker', 'bedroom_pop', 'trap_hopeful', 'indie_sadcore',
    'synthwave_kid', 'country_crossover', 'mall_punk', 'afrobeats_dreamer'
  )),
  constraint players_instrument check (instrument is null or instrument in ('guitar', 'keys')),
  constraint players_band_name check (band_name is null or char_length(btrim(band_name)) between 2 and 30),
  constraint players_step check (onboarding_step in ('name_done', 'look_done', 'sound_done', 'lottery_done', 'home_done')),
  constraint players_invite_code_format check (invite_code ~ '^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$'),
  constraint players_look_size check (pg_column_size(look) < 2048),
  constraint players_fame check (fame >= 0)
);

-- Names are claimed: unique regardless of case.
create unique index players_display_name_key on public.players (lower(display_name));

-- ---------------------------------------------------------------------------
-- Invites: who brought whom. One row per invited player, ever.
-- reward_paid_at stays null until invite rewards switch on (v0.2, paid retroactively).
-- ---------------------------------------------------------------------------
create table public.invites (
  id             bigint generated always as identity primary key,
  inviter_id     uuid not null references public.players (id) on delete cascade,
  invitee_id     uuid not null unique references public.players (id) on delete cascade,
  invite_code    text not null,
  created_at     timestamptz not null default now(),
  reward_paid_at timestamptz,

  constraint invites_not_self check (inviter_id <> invitee_id)
);

create index invites_inviter_idx on public.invites (inviter_id, created_at);

-- ---------------------------------------------------------------------------
-- Row-level security: players read their own row; nobody writes directly.
-- All writes go through the security-definer functions below.
-- ---------------------------------------------------------------------------
alter table public.players enable row level security;
alter table public.invites enable row level security;

create policy "players read own row" on public.players
  for select to authenticated using (id = auth.uid());

create policy "inviters read own invites" on public.invites
  for select to authenticated using (inviter_id = auth.uid());

revoke insert, update, delete on public.players, public.invites from anon, authenticated;

-- ---------------------------------------------------------------------------
-- updated_at bookkeeping
-- ---------------------------------------------------------------------------
create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger players_touch_updated_at
  before update on public.players
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Invite code generator (same alphabet as lib/invite.ts)
-- ---------------------------------------------------------------------------
create function public.generate_invite_code() returns text
language plpgsql volatile as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  code text;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.players where invite_code = code);
  end loop;
  return code;
end;
$$;

-- ---------------------------------------------------------------------------
-- create_player: claims the username and credits the inviter in one transaction.
-- Usernames are @handles: 3 to 20 letters, numbers, _ or . (a leading @ is dropped).
-- Calling it again returns the existing player unchanged.
-- ---------------------------------------------------------------------------
create function public.create_player(
  p_display_name text,
  p_invite_code text,
  p_age_confirmed boolean
) returns public.players
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  clean_name text := regexp_replace(btrim(coalesce(p_display_name, '')), '^@+', '');
  inviter uuid;
  created public.players;
begin
  if uid is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;

  select * into created from public.players where id = uid;
  if found then
    return created;
  end if;

  if coalesce(p_age_confirmed, false) is not true then
    raise exception 'age_not_confirmed' using errcode = '22023';
  end if;

  if clean_name !~ '^[A-Za-z0-9_.]{3,20}$' then
    raise exception 'name_format' using errcode = '22023';
  end if;

  if exists (select 1 from public.players where lower(display_name) = lower(clean_name)) then
    raise exception 'name_taken' using errcode = '23505';
  end if;

  insert into public.players (id, display_name, invite_code, age_confirmed_at)
  values (uid, clean_name, public.generate_invite_code(), now())
  returning * into created;

  if p_invite_code is not null then
    select id into inviter from public.players
      where invite_code = upper(btrim(p_invite_code)) and id <> uid;
    if inviter is not null then
      insert into public.invites (inviter_id, invitee_id, invite_code)
      values (inviter, uid, upper(btrim(p_invite_code)))
      on conflict (invitee_id) do nothing;
    end if;
  end if;

  return created;
end;
$$;

-- ---------------------------------------------------------------------------
-- my_crew: the signed-in player's invited friends, oldest first.
-- Exposes only the name, scene and join time of people they invited.
-- ---------------------------------------------------------------------------
create function public.my_crew()
returns table (display_name text, scene text, joined_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select p.display_name, p.scene, i.created_at
  from public.invites i
  join public.players p on p.id = i.invitee_id
  where i.inviter_id = auth.uid()
  order by i.created_at asc;
$$;

-- ---------------------------------------------------------------------------
-- is_name_available: lets the name field check before submitting.
-- ---------------------------------------------------------------------------
create function public.is_name_available(p_display_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.players
    where lower(display_name) = lower(regexp_replace(btrim(coalesce(p_display_name, '')), '^@+', ''))
  );
$$;

-- ---------------------------------------------------------------------------
-- set_music_muted: the HUD's speaker button, remembered on the account.
-- ---------------------------------------------------------------------------
create function public.set_music_muted(p_muted boolean)
returns boolean
language sql
security definer
set search_path = public
as $$
  update public.players set music_muted = coalesce(p_muted, true) where id = auth.uid()
  returning music_muted;
$$;

-- ---------------------------------------------------------------------------
-- Grants (hardening, Clout City 0049): Supabase gives new functions to anon and authenticated,
-- so every function is revoked from all three roles first and granted back only where the
-- browser needs it.
-- ---------------------------------------------------------------------------
revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.generate_invite_code() from public, anon, authenticated;
revoke all on function public.create_player(text, text, boolean) from public, anon, authenticated;
revoke all on function public.my_crew() from public, anon, authenticated;
revoke all on function public.is_name_available(text) from public, anon, authenticated;
revoke all on function public.set_music_muted(boolean) from public, anon, authenticated;

grant execute on function public.create_player(text, text, boolean) to authenticated;
grant execute on function public.my_crew() to authenticated;
grant execute on function public.is_name_available(text) to authenticated;
grant execute on function public.set_music_muted(boolean) to authenticated;
