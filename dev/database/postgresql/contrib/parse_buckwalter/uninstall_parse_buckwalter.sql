/* $PostgreSQL: pgsql/contrib/test_parser/uninstall_test_parser.sql,v 1.3 2007/11/13 04:24:29 momjian Exp $ */

-- Adjust this setting to control where the objects get dropped.
SET search_path = public;

DROP TEXT SEARCH PARSER buckwalter;

DROP FUNCTION buckwalter_start_parse(internal, int4);

DROP FUNCTION buckwalter_get_next_token(internal, internal, internal);

DROP FUNCTION buckwalter_end_parse(internal);

DROP FUNCTION buckwalter_get_token_types(internal);
