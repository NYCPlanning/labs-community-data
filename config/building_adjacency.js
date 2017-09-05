module.exports = borocd => `
  SELECT
    sum(numbldgs) as value, building_age as group,
    CASE WHEN totalbuildings > 0 THEN ROUND(count(building_age)::numeric / NULLIF(totalbuildings,0), 3) ELSE NULL END AS value_pct
  FROM (
    SELECT
    CASE
      WHEN unitsres > 0 AND proxcode = '1'  THEN 'Detached'
      WHEN unitsres > 0 AND (proxcode = '2' OR proxcode = '3') THEN 'Attached or Semi-detached'
      ELSE 'Unknown'
    END AS building_age,
    numbldgs,
    SUM (numbldgs) OVER () as totalbuildings
    FROM support_mappluto a
    INNER JOIN support_admin_cdboundaries b
    ON ST_Contains(b.the_geom, a.the_geom)
    AND b.borocd = '${borocd}'
    INNER JOIN support_waterfront_pfirm15 c
    ON ST_Intersects(a.the_geom, c.the_geom)
    AND (fld_zone = 'AE' OR fld_zone = 'VE')
  ) x
  GROUP BY building_age, totalbuildings
  ORDER BY array_position(array['Detached','Attached or Semi-detached','Unknown'], building_age)
`;
