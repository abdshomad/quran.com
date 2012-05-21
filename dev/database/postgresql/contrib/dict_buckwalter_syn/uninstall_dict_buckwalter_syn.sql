/* $PostgreSQL: pgsql/contrib/dict_buckwalter_syn/uninstall_dict_buckwalter_syn.sql,v 1.3 2007/11/13 04:24:27 momjian Exp $ */

-- Adjust this setting to control where the objects get dropped.
SET search_path = public;

DROP TEXT SEARCH DICTIONARY buckwalter_syn;

DROP TEXT SEARCH TEMPLATE buckwalter_syn_template;

DROP FUNCTION dbuckwalter_syn_init(internal);

DROP FUNCTION dbuckwalter_syn_lexize(internal,internal,internal,internal);
