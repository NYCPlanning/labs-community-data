module.exports = borocd => `
  SELECT
  SUM(numbldgs) as value,
  building_typology as group,
  ROUND(SUM(numbldgs)::numeric / NULLIF(propertytotal,0), 4) AS value_pct
  FROM (
    SELECT
      numbldgs,
    CASE

      WHEN (unitsres < 3 AND unitsres > 0) AND (comarea = 0 AND officearea = 0 AND retailarea = 0 AND factryarea = 0) THEN '1-2 Family Homes'
      WHEN (unitsres < 6 AND unitsres > 2) AND (numfloors < 5) AND (comarea = 0 AND officearea = 0 AND retailarea = 0 AND factryarea = 0) THEN 'Small Apartments (<= 5 units, < 5 stories)'
      WHEN (unitsres >= 6 AND numfloors >= 5) AND (comarea = 0 AND officearea = 0 AND retailarea = 0 AND factryarea = 0) THEN 'Large Apartments (> 5 units, 5-plus stories)'
      WHEN (unitsres > 2) AND (comarea > 0 OR officearea > 0 OR retailarea > 0 OR factryarea > 0) THEN 'Mixed-use Apartments'
      WHEN (unitsres = 0) AND (comarea > 0 OR officearea > 0 OR retailarea > 0) AND factryarea = 0 THEN 'Commercial'
      WHEN (unitsres = 0) AND factryarea > 0 THEN 'Manufacturing'
      ELSE 'Public Facilities, Institutions, Other'
    END AS building_typology,
    SUM (numbldgs) OVER () as propertytotal
    FROM support_mappluto a
    INNER JOIN support_admin_cdboundaries b
    ON ST_Contains(b.the_geom, a.the_geom)
    AND b.borocd = '${borocd}'
    INNER JOIN support_waterfront_pfirm15 c
    ON ST_Intersects(a.the_geom, c.the_geom)
    AND (fld_zone = 'AE' OR fld_zone = 'VE')
  ) x
  GROUP BY building_typology, propertytotal
  ORDER BY SUM(numbldgs) DESC
`;
