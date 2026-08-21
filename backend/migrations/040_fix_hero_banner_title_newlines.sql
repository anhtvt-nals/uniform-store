UPDATE banners
SET title = jsonb_set(
    jsonb_set(
        jsonb_set(title, '{vi}', to_jsonb(REPLACE(COALESCE(title->>'vi', ''), E'\\n', E'\n')), true),
        '{en}', to_jsonb(REPLACE(COALESCE(title->>'en', ''), E'\\n', E'\n')), true
    ),
    '{de}', to_jsonb(REPLACE(COALESCE(title->>'de', ''), E'\\n', E'\n')), true
)
WHERE position = 'hero';
