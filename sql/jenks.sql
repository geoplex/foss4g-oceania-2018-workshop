CREATE OR REPLACE FUNCTION jenks_break_class(jenks_breaks numeric[], val numeric) RETURNS int AS $$
    BEGIN
        IF val <= jenks_breaks[1] THEN
            RETURN 1;
        END IF;

        FOR i IN array_lower(jenks_breaks, 1) .. array_upper(jenks_breaks, 1) - 1
        LOOP
            IF val > jenks_breaks[i] AND val <= jenks_breaks[i + 1] THEN
                RETURN i + 1;
            END IF;
        END LOOP;

        RETURN 0;
    END;
$$ LANGUAGE plpgsql;
