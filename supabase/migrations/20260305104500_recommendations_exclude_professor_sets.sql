-- Keep global recommendations focused on official learning catalog.
-- Professor-authored sets should stay section-scoped.

drop function if exists public.get_recommendations(integer) cascade;
create function public.get_recommendations(limit_count int default 6)
returns table (
  quiz_set_id uuid,
  title text,
  course_id text,
  description text,
  difficulty text,
  est_minutes int,
  tags text[],
  reason text,
  recommendation_score numeric
)
language sql
stable
security definer
set search_path = public
as $$
with my_courses as (
  select uc.course_id
  from public.user_courses uc
  where uc.user_id = auth.uid()
),
weak_tags as (
  select
    mbt.tag,
    mbt.mastery,
    row_number() over (order by mbt.mastery asc, mbt.attempts_count desc) as rn
  from public.mastery_by_topic mbt
  where mbt.user_id = auth.uid()
),
weak_tag_list as (
  select coalesce(array_agg(tag), '{}'::text[]) as tags
  from weak_tags
  where rn <= 8
),
has_mastery as (
  select exists(select 1 from weak_tags) as present
),
candidate as (
  select
    qs.id,
    qs.title,
    qs.course_id,
    qs.description,
    qs.difficulty,
    qs.est_minutes,
    qs.tags,
    qs.created_at,
    (
      coalesce(
        (
          select count(*)::numeric
          from unnest(qs.tags) t
          where t = any(wtl.tags)
        ),
        0
      ) * 25
      + greatest(0, 18 - qs.est_minutes)
      + case when (select present from has_mastery) then 0 else 8 end
    ) as recommendation_score,
    (
      case
        when (select present from has_mastery) then
          case
            when exists (
              select 1
              from unnest(qs.tags) t
              where t = any(wtl.tags)
            ) then
              'Targets weak topics: ' || coalesce(
                (
                  select string_agg(t, ', ' order by t)
                  from (
                    select distinct t
                    from unnest(qs.tags) t
                    where t = any(wtl.tags)
                    limit 2
                  ) x
                ),
                'focused review'
              )
            else
              'Balanced reinforcement in enrolled courses'
          end
        else
          'Great next step for enrolled courses'
      end
    ) as reason
  from public.quiz_sets qs
  cross join weak_tag_list wtl
  where qs.is_published = true
    and not exists (
      select 1
      from public.questions pq
      where pq.quiz_set_id = qs.id
        and coalesce(pq.from_professor, false) = true
    )
    and exists(select 1 from my_courses mc where mc.course_id = qs.course_id)
)
select
  c.id as quiz_set_id,
  c.title,
  c.course_id,
  c.description,
  c.difficulty,
  c.est_minutes,
  c.tags,
  c.reason,
  c.recommendation_score
from candidate c
order by c.recommendation_score desc, c.est_minutes asc, c.created_at desc nulls last
limit least(20, greatest(1, coalesce(limit_count, 6)));
$$;

grant execute on function public.get_recommendations(int) to authenticated;
