/* $PostgreSQL: pgsql/contrib/dict_buckwalter/uninstall_dict_buckwalter.sql,v 1.3 2007/11/13 04:24:27 momjian Exp $ */

-- Adjust this setting to control where the objects get dropped.
SET search_path = public;

DROP TEXT SEARCH DICTIONARY buckwalter;

DROP TEXT SEARCH TEMPLATE buckwalter_template;

DROP FUNCTION dbuckwalter_init(internal);

DROP FUNCTION dbuckwalter_lexize(internal,internal,internal,internal);
