module.exports = borocd => `
  SELECT
  SUM(unitsres) as value,
  building_typology as group,
  ROUND(SUM(unitsres)::numeric / NULLIF(propertytotal,0), 4) AS value_pct
  FROM (
    SELECT
      unitsres,
    CASE

      WHEN (unitsres < 3 AND unitsres > 0) AND (comarea = 0 AND officearea = 0 AND retailarea = 0 AND factryarea = 0) THEN '1-2 Family'
      WHEN (unitsres < 6 AND unitsres > 2) AND (numfloors < 5) AND (comarea = 0 AND officearea = 0 AND retailarea = 0 AND factryarea = 0) THEN 'Small Apartment Buildings'
      WHEN (unitsres >= 6 AND numfloors >= 5) AND (comarea = 0 AND officearea = 0 AND retailarea = 0 AND factryarea = 0) THEN 'Big Apartment Buildings'
      WHEN (unitsres > 2) AND (comarea > 0 OR officearea > 0 OR retailarea > 0 OR factryarea > 0) THEN 'Mixed-Use Apartment Buildings'
      WHEN (unitsres = 0) AND (comarea > 0 OR officearea > 0 OR retailarea > 0) AND factryarea = 0 THEN 'Commercial Buildings'
      WHEN (unitsres = 0) AND factryarea > 0 THEN 'Manufacturing Buildings'
      ELSE 'Public facilities, utilities and other buildings'
    END AS building_typology,
    SUM (unitsres) OVER () as propertytotal
    FROM support_mappluto a
    INNER JOIN support_admin_cdboundaries b
    ON ST_Contains(b.the_geom, a.the_geom)
    AND b.borocd = '${borocd}'
    INNER JOIN support_waterfront_pfirm15 c
    ON ST_Intersects(a.the_geom, c.the_geom)
    AND (fld_zone = 'AE' OR fld_zone = 'VE')
  ) x
  GROUP BY building_typology, propertytotal
  ORDER BY SUM(unitsres) DESC
`;
