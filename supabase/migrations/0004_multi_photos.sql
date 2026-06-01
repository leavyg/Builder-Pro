-- Multiple photos per defect (problem + fix). The single *_photo_url columns stay
-- as the "cover" image (first photo) so existing thumbnails/emails keep working.
-- Run in the Supabase SQL Editor.
alter table defects add column if not exists problem_photo_urls text[];
alter table defects add column if not exists fixed_photo_urls text[];

-- Backfill existing rows so they render correctly under the new gallery code.
update defects
  set problem_photo_urls = array[problem_photo_url]
  where problem_photo_url is not null and problem_photo_urls is null;

update defects
  set fixed_photo_urls = array[fixed_photo_url]
  where fixed_photo_url is not null and fixed_photo_urls is null;
