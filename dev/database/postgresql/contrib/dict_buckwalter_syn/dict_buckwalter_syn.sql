/* $PostgreSQL: pgsql/contrib/dict_buckwalter_syn/dict_buckwalter_syn.sql.in,v 1.3 2007/11/13 04:24:27 momjian Exp $ */

-- Adjust this setting to control where the objects get created.
SET search_path = public;

CREATE OR REPLACE FUNCTION dbuckwalter_syn_init(internal)
        RETURNS internal
        AS '$libdir/dict_buckwalter_syn'
        LANGUAGE C STRICT;

CREATE OR REPLACE FUNCTION dbuckwalter_syn_lexize(internal, internal, internal, internal)
        RETURNS internal
        AS '$libdir/dict_buckwalter_syn'
        LANGUAGE C STRICT;

DROP TEXT SEARCH TEMPLATE IF EXISTS buckwalter_syn_template CASCADE;
CREATE TEXT SEARCH TEMPLATE buckwalter_syn_template (
        LEXIZE = dbuckwalter_syn_lexize,
          INIT = dbuckwalter_syn_init
);

CREATE TEXT SEARCH DICTIONARY quran.buckwalter_syn (
	TEMPLATE = buckwalter_syn_template,
	SYNONYMS = buckwalter
);

CREATE TEXT SEARCH CONFIGURATION quran.buckwalter_syn (
	PARSER = buckwalter
);

ALTER TEXT SEARCH CONFIGURATION quran.buckwalter_syn ADD MAPPING FOR WORD WITH quran.buckwalter_syn;

COMMENT ON TEXT SEARCH DICTIONARY quran.buckwalter_syn IS 'buckwalter syn (case sensitive clone of syn)';
