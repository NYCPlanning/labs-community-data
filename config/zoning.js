module.exports = borocd => `
  WITH zones as (
    SELECT ST_Intersection(ST_CollectionExtract(ST_MakeValid(a.the_geom),3), ST_CollectionExtract(ST_MakeValid(b.the_geom),3)) as the_geom, zonedist
    FROM support_zoning_zd a, support_admin_cdboundaries b
    WHERE ST_intersects(ST_CollectionExtract(ST_MakeValid(a.the_geom),3), b.the_geom)
    AND b.borocd = '${borocd}'
  ),
  totalsm AS (
    SELECT sum(ST_Area(the_geom::geography)) as total
    FROM zones
  )

  SELECT sum(percent) as percent, zonedist FROM (
    SELECT  ROUND((sum(ST_Area(the_geom::geography))/totalsm.total)::numeric,4) as percent, LEFT(zonedist, 1) as zonedist
  FROM zones, totalsm
  GROUP BY zonedist, totalsm.total
  ORDER BY percent DESC
  ) x
  GROUP BY zonedist
`;
