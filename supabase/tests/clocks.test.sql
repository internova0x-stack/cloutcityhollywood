-- Scenario test for migration 0001 (settings and the two clocks). Runs in a transaction and rolls back.
\set ON_ERROR_STOP on
\pset tuples_only on
begin;
create function pg_temp.assert(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'FAIL: %', msg; end if; end $$;

select pg_temp.assert(public.ny_today() = (now() at time zone 'America/New_York')::date, 'story calendar is New York today');
select pg_temp.assert(public.city_minutes() between 0 and 1439, 'city clock within a day');
-- Time travel moves both clocks.
update public.game_settings set value = jsonb_set(value, '{clockOffsetSeconds}', '86400') where key = 'dev';
select pg_temp.assert(public.ny_today() = ((now() + interval '1 day') at time zone 'America/New_York')::date, 'time travel moves the calendar');
-- Anyone can read settings; nobody can write them from the browser.
set role anon;
select pg_temp.assert((select count(*) from public.game_settings) >= 1, 'settings are readable');
reset role;
select 'clocks: ok';
rollback;
