/* $PostgreSQL: pgsql/contrib/dict_buckwalter_xsyn/uninstall_dict_buckwalter_xsyn.sql,v 1.3 2007/11/13 04:24:27 momjian Exp $ */

-- Adjust this setting to control where the objects get dropped.
SET search_path = public;

DROP TEXT SEARCH DICTIONARY buckwalter_xsyn;

DROP TEXT SEARCH TEMPLATE buckwalter_xsyn_template;

DROP FUNCTION dbuckwalter_xsyn_init(internal);

DROP FUNCTION dbuckwalter_xsyn_lexize(internal,internal,internal,internal);
