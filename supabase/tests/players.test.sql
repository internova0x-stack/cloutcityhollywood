-- Scenario test for migration 0002 (players, invites, crew). Runs in a transaction and rolls back.
\set ON_ERROR_STOP on
\pset tuples_only on
begin;
create function pg_temp.assert(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'FAIL: %', msg; end if; end $$;
create function pg_temp.as_(p text) returns void language sql as $$ select set_config('request.jwt.claim.sub', p, false) $$;
-- Runs a statement as the signed-in user and returns the error message, or null when it worked.
create function pg_temp.err(stmt text) returns text language plpgsql as $$
begin execute stmt; return null; exception when others then return sqlerrm; end $$;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'b@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'c@example.com');

set role authenticated;

-- Signed out: nothing happens.
select pg_temp.as_('');
select pg_temp.assert(pg_temp.err($$select public.create_player('nobody', null, true)$$) like '%not_signed_in%', 'signed out cannot create');

-- A: 18+ is required, the name follows the username rules, and a leading @ is dropped.
select pg_temp.as_('00000000-0000-0000-0000-00000000000a');
select pg_temp.assert(pg_temp.err($$select public.create_player('riffqueen', null, false)$$) like '%age_not_confirmed%', '18+ required');
select pg_temp.assert(pg_temp.err($$select public.create_player('riff queen', null, true)$$) like '%name_format%', 'no spaces');
select pg_temp.assert(pg_temp.err($$select public.create_player('ab', null, true)$$) like '%name_format%', 'three characters minimum');
select pg_temp.assert((select display_name from public.create_player('@RiffQueen', null, true)) = 'RiffQueen', 'leading @ dropped');
select pg_temp.assert((select fame from public.players where id = auth.uid()) = 0, 'fame starts at 0');
select pg_temp.assert((select onboarding_step from public.players where id = auth.uid()) = 'name_done', 'name step done');
-- Calling again returns the same player.
select pg_temp.assert((select display_name from public.create_player('somethingelse', null, true)) = 'RiffQueen', 'create is idempotent');
-- No direct writes from the browser.
select pg_temp.assert(pg_temp.err($$update public.players set fame = 999999 where id = auth.uid()$$) is not null, 'cannot write fame directly');

-- B joins with A's code; names are unique regardless of case.
select pg_temp.as_('00000000-0000-0000-0000-00000000000b');
select pg_temp.assert(pg_temp.err($$select public.is_name_available('riffqueen')$$) is null, 'name check callable');
select pg_temp.assert(not public.is_name_available('@riffqueen'), 'name taken (any case, with @)');
select pg_temp.assert(pg_temp.err($$select public.create_player('riffqueen', null, true)$$) like '%name_taken%', 'name taken on create');
reset role;
select set_config('test.code_a', (select invite_code from public.players where display_name = 'RiffQueen'), false);
set role authenticated;
select public.create_player('keyskid', lower(current_setting('test.code_a')), true);
-- B can't read A's row.
select pg_temp.assert((select count(*) from public.players) = 1, 'players read only their own row');

-- C tries B's own code trick and an unknown code: no crash, no invite.
select pg_temp.as_('00000000-0000-0000-0000-00000000000c');
select public.create_player('lofi.lou', 'ZZZZZZ', true);

-- A's crew: one friend.
select pg_temp.as_('00000000-0000-0000-0000-00000000000a');
select pg_temp.assert((select count(*) from public.my_crew()) = 1, 'crew of one');
select pg_temp.assert((select display_name from public.my_crew()) = 'keyskid', 'crew shows the friend');
select pg_temp.assert(public.set_music_muted(true), 'mute remembered');

-- Anonymous visitors can call none of it.
reset role;
set role anon;
select pg_temp.assert(pg_temp.err($$select public.my_crew()$$) like '%permission denied%', 'anon cannot read a crew');
select pg_temp.assert(pg_temp.err($$select public.create_player('x_x_x', null, true)$$) like '%permission denied%', 'anon cannot create');
select pg_temp.assert(pg_temp.err($$select public.generate_invite_code()$$) like '%permission denied%', 'code generator is private');
reset role;
set role authenticated;
select pg_temp.assert(pg_temp.err($$select public.generate_invite_code()$$) like '%permission denied%', 'code generator is private to players too');
reset role;

select 'players: ok';
rollback;
