-- Ensure free-response and homework-style sets are classified as homework mode.
update public.quiz_sets
set
  mode = 'homework',
  is_exam_simulation = false,
  question_count_target = null
where
  (
    lower(id::text) like 'de-hw%'
    or lower(title) like '%homework%'
    or lower(title) like '%free response%'
    or lower(tags::text) like '%free-response%'
    or lower(tags::text) like '%step-by-step%'
  )
  and mode <> 'homework';
