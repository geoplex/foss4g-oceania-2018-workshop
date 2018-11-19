DROP TABLE IF EXISTS geoserver.abs_stats CASCADE;
CREATE TABLE geoserver.abs_stats AS
SELECT a.area_id,
    a.area_type,
    b.tot_p_p,
    b.tot_p_p / (ST_Area(ST_Transform(a.geom, 3111)) / 100000.0) AS tot_p_p_sq_km,
    b.tot_p_f,
    b.tot_p_f / (ST_Area(ST_Transform(a.geom, 3111)) / 100000.0) AS tot_p_f_sq_km,
    b.tot_p_m,
    b.tot_p_m / (ST_Area(ST_Transform(a.geom, 3111)) / 100000.0) AS tot_p_m_sq_km,
    b.indigenous_p_tot_p,
    b.indigenous_p_tot_p / (ST_Area(ST_Transform(a.geom, 3111)) / 100000.0) AS indigenous_p_tot_p_sq_km,
    c.median_age_persons,
    c.median_rent_weekly,
    c.median_tot_prsnl_inc_weekly,
    c.average_household_size,
    ST_Area(ST_Transform(a.geom, 3111)) / 100000.0 AS area_sq_km,
    a.geom,
    ST_Centroid(a.geom) as centroid_geom
FROM geoserver.abs_areas a
LEFT JOIN geoserver.abs_g01 b ON a.area_id = b.area_id
LEFT JOIN geoserver.abs_g02 c ON a.area_id = c.area_id;

CREATE INDEX sidx_abs_stats_geom ON geoserver.abs_stats USING gist (geom);

CREATE INDEX sidx_abs_stats_centroid_geom ON geoserver.abs_stats USING gist (centroid_geom);

ALTER TABLE geoserver.abs_stats ADD COLUMN tot_p_p_sq_km_cl int;
WITH jenks_bins AS
(SELECT CDB_JenksBins(
    (SELECT array_agg(tot_p_p_sq_km)::numeric[] FROM geoserver.abs_stats WHERE tot_p_p_sq_km IS NOT NULL),
    4
) AS breaks)
UPDATE geoserver.abs_stats a
SET tot_p_p_sq_km_cl = jenks_break_class(b.breaks, a.tot_p_p_sq_km::numeric)
FROM jenks_bins b;

CREATE INDEX idx_tot_p_p_sq_km_cl ON geoserver.abs_stats (tot_p_p_sq_km_cl);

ALTER TABLE geoserver.abs_stats ADD COLUMN tot_p_f_sq_km_cl int;
WITH jenks_bins AS
(SELECT CDB_JenksBins(
    (SELECT array_agg(tot_p_f_sq_km)::numeric[] FROM geoserver.abs_stats WHERE tot_p_f_sq_km IS NOT NULL),
    4
) AS breaks)
UPDATE geoserver.abs_stats a
SET tot_p_f_sq_km_cl = jenks_break_class(b.breaks, a.tot_p_f_sq_km::numeric)
FROM jenks_bins b;

CREATE INDEX idx_tot_p_f_sq_km_cl ON geoserver.abs_stats (tot_p_f_sq_km_cl);

ALTER TABLE geoserver.abs_stats ADD COLUMN tot_p_m_sq_km_cl int;
WITH jenks_bins AS
(SELECT CDB_JenksBins(
    (SELECT array_agg(tot_p_m_sq_km)::numeric[] FROM geoserver.abs_stats WHERE tot_p_m_sq_km IS NOT NULL),
    4
) AS breaks)
UPDATE geoserver.abs_stats a
SET tot_p_m_sq_km_cl = jenks_break_class(b.breaks, a.tot_p_m_sq_km::numeric)
FROM jenks_bins b;

CREATE INDEX idx_tot_p_m_sq_km_cl ON geoserver.abs_stats (tot_p_m_sq_km_cl);

ALTER TABLE geoserver.abs_stats ADD COLUMN indigenous_p_tot_p_sq_km_cl int;
WITH jenks_bins AS
(SELECT CDB_JenksBins(
    (SELECT array_agg(indigenous_p_tot_p_sq_km)::numeric[] FROM geoserver.abs_stats WHERE indigenous_p_tot_p_sq_km IS NOT NULL),
    4
) AS breaks)
UPDATE geoserver.abs_stats a
SET indigenous_p_tot_p_sq_km_cl = jenks_break_class(b.breaks, a.indigenous_p_tot_p_sq_km::numeric)
FROM jenks_bins b;

CREATE INDEX idx_indigenous_p_tot_p_sq_km_cl ON geoserver.abs_stats (indigenous_p_tot_p_sq_km_cl);

ALTER TABLE geoserver.abs_stats ADD COLUMN median_age_persons_cl int;
WITH jenks_bins AS
(SELECT CDB_JenksBins(
    (SELECT array_agg(median_age_persons)::numeric[] FROM geoserver.abs_stats WHERE median_age_persons IS NOT NULL),
    4
) AS breaks)
UPDATE geoserver.abs_stats a
SET median_age_persons_cl = jenks_break_class(b.breaks, a.median_age_persons::numeric)
FROM jenks_bins b;

CREATE INDEX idx_median_age_persons_cl ON geoserver.abs_stats (median_age_persons_cl);

ALTER TABLE geoserver.abs_stats ADD COLUMN median_rent_weekly_cl int;
WITH jenks_bins AS
(SELECT CDB_JenksBins(
    (SELECT array_agg(median_rent_weekly)::numeric[] FROM geoserver.abs_stats WHERE median_rent_weekly IS NOT NULL),
    4
) AS breaks)
UPDATE geoserver.abs_stats a
SET median_rent_weekly_cl = jenks_break_class(b.breaks, a.median_rent_weekly::numeric)
FROM jenks_bins b;

CREATE INDEX idx_median_rent_weekly_cl ON geoserver.abs_stats (median_rent_weekly_cl);

ALTER TABLE geoserver.abs_stats ADD COLUMN median_tot_prsnl_inc_weekly_cl int;
WITH jenks_bins AS
(SELECT CDB_JenksBins(
    (SELECT array_agg(median_tot_prsnl_inc_weekly)::numeric[] FROM geoserver.abs_stats WHERE median_tot_prsnl_inc_weekly IS NOT NULL),
    4
) AS breaks)
UPDATE geoserver.abs_stats a
SET median_tot_prsnl_inc_weekly_cl = jenks_break_class(b.breaks, a.median_tot_prsnl_inc_weekly::numeric)
FROM jenks_bins b;

CREATE INDEX idx_median_tot_prsnl_inc_weekly_cl ON geoserver.abs_stats (median_tot_prsnl_inc_weekly_cl);

ALTER TABLE geoserver.abs_stats ADD COLUMN average_household_size_cl int;
WITH jenks_bins AS
(SELECT CDB_JenksBins(
    (SELECT array_agg(average_household_size)::numeric[] FROM geoserver.abs_stats WHERE average_household_size IS NOT NULL),
    4
) AS breaks)
UPDATE geoserver.abs_stats a
SET average_household_size_cl = jenks_break_class(b.breaks, a.average_household_size::numeric)
FROM jenks_bins b;

CREATE INDEX idx_average_household_size_cl ON geoserver.abs_stats (average_household_size_cl);
