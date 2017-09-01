module.exports = borocd => `
  SELECT
    sum(numbldgs) as value, building_age as group,
    CASE WHEN totalbuildings > 0 THEN ROUND(count(building_age)::numeric / NULLIF(totalbuildings,0), 4) ELSE NULL END AS value_pct
  FROM (
    SELECT
    CASE
      WHEN yearbuilt > 0 AND yearbuilt < 1961  THEN 'Pre-1961'
      WHEN yearbuilt >= 1961 AND YearBuilt < 1983 THEN '1961-1982'
      WHEN yearbuilt >= 1983 AND YearBuilt < 2013 THEN '1983-2012'
      WHEN yearbuilt >= 2013 THEN '2013-Present'
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
  ORDER BY array_position(array['Pre-1961','1961-1982','1983-2012','2013-Present','Unknown'], building_age)
`;
