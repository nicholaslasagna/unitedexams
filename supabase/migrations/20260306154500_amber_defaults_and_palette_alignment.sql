alter table public.user_preferences
  alter column accent_hue set default 38,
  alter column accent_strength set default 56,
  alter column accent_preset set default 'amber',
  alter column accent_saturation set default 92,
  alter column accent_lightness set default 50;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'user_preferences_accent_saturation_check'
  ) then
    alter table public.user_preferences
      drop constraint user_preferences_accent_saturation_check;
  end if;

  alter table public.user_preferences
    add constraint user_preferences_accent_saturation_check
    check (accent_saturation between 38 and 95);
end $$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'user_preferences_accent_preset_check'
  ) then
    alter table public.user_preferences
      drop constraint user_preferences_accent_preset_check;
  end if;

  alter table public.user_preferences
    add constraint user_preferences_accent_preset_check
    check (
      accent_preset in (
        'amethyst',
        'nebula',
        'lavender',
        'indigo',
        'aurora',
        'midnight',
        'rose',
        'coral',
        'amber',
        'emerald',
        'sage',
        'slate',
        'custom'
      )
    );
end $$;

update public.user_preferences
set accent_preset = case
  when accent_hue = 265 and accent_saturation = 72 and accent_lightness = 62 and accent_strength = 60 then 'amethyst'
  when accent_hue = 248 and accent_saturation = 68 and accent_lightness = 60 and accent_strength = 56 then 'nebula'
  when accent_hue = 280 and accent_saturation = 60 and accent_lightness = 68 and accent_strength = 52 then 'lavender'
  when accent_hue = 232 and accent_saturation = 70 and accent_lightness = 57 and accent_strength = 62 then 'indigo'
  when accent_hue = 198 and accent_saturation = 72 and accent_lightness = 56 and accent_strength = 58 then 'aurora'
  when accent_hue = 220 and accent_saturation = 65 and accent_lightness = 42 and accent_strength = 70 then 'midnight'
  when accent_hue = 338 and accent_saturation = 74 and accent_lightness = 58 and accent_strength = 60 then 'rose'
  when accent_hue = 12 and accent_saturation = 80 and accent_lightness = 58 and accent_strength = 58 then 'coral'
  when accent_hue = 38 and accent_saturation = 92 and accent_lightness = 50 and accent_strength = 56 then 'amber'
  when accent_hue = 152 and accent_saturation = 62 and accent_lightness = 50 and accent_strength = 54 then 'emerald'
  when accent_hue = 140 and accent_saturation = 30 and accent_lightness = 52 and accent_strength = 44 then 'sage'
  when accent_hue = 215 and accent_saturation = 20 and accent_lightness = 52 and accent_strength = 40 then 'slate'
  else accent_preset
end
where accent_preset is distinct from case
  when accent_hue = 265 and accent_saturation = 72 and accent_lightness = 62 and accent_strength = 60 then 'amethyst'
  when accent_hue = 248 and accent_saturation = 68 and accent_lightness = 60 and accent_strength = 56 then 'nebula'
  when accent_hue = 280 and accent_saturation = 60 and accent_lightness = 68 and accent_strength = 52 then 'lavender'
  when accent_hue = 232 and accent_saturation = 70 and accent_lightness = 57 and accent_strength = 62 then 'indigo'
  when accent_hue = 198 and accent_saturation = 72 and accent_lightness = 56 and accent_strength = 58 then 'aurora'
  when accent_hue = 220 and accent_saturation = 65 and accent_lightness = 42 and accent_strength = 70 then 'midnight'
  when accent_hue = 338 and accent_saturation = 74 and accent_lightness = 58 and accent_strength = 60 then 'rose'
  when accent_hue = 12 and accent_saturation = 80 and accent_lightness = 58 and accent_strength = 58 then 'coral'
  when accent_hue = 38 and accent_saturation = 92 and accent_lightness = 50 and accent_strength = 56 then 'amber'
  when accent_hue = 152 and accent_saturation = 62 and accent_lightness = 50 and accent_strength = 54 then 'emerald'
  when accent_hue = 140 and accent_saturation = 30 and accent_lightness = 52 and accent_strength = 44 then 'sage'
  when accent_hue = 215 and accent_saturation = 20 and accent_lightness = 52 and accent_strength = 40 then 'slate'
  else accent_preset
end;
