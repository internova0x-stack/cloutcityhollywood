-- Clout City: Hollywood Music, v0.1 "Tap In", step 1: settings and the two clocks.
-- Player data is built to last (Milestones rule 2): later migrations add, they never rebuild.
-- Ported from Clout City NYC (its migrations 0003 and 0004).

-- Tunable numbers the server reads (economy, venues, dev tools), mirrored in lib/ for the browser.
create table public.game_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.game_settings enable row level security;
create policy "settings are public" on public.game_settings for select to anon, authenticated using (true);

insert into public.game_settings (key, value) values ('dev', '{"tools": false, "clockOffsetSeconds": 0}');

-- The story calendar: real New York days (beats, resets, bills, one paid show per venue a day), with the
-- dev time-travel offset.
create function public.game_now() returns timestamptz
language sql stable security definer set search_path = public
as $$
  select now() + make_interval(secs => coalesce((select (value ->> 'clockOffsetSeconds')::double precision
                                                  from public.game_settings where key = 'dev'), 0))
$$;

create function public.ny_today() returns date
language sql stable security definer set search_path = public
as $$ select (public.game_now() at time zone 'America/New_York')::date $$;

-- The city clock: one city day every 2 real hours (day, night, venue hours and show-slot times).
create function public.city_minutes() returns int
language sql stable security definer set search_path = public
as $$ select floor(mod((extract(epoch from public.game_now()) * 1000)::numeric, 7200000) / 7200000 * 1440)::int $$;
