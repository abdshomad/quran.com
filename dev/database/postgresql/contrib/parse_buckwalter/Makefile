# $PostgreSQL: pgsql/contrib/parse_buckwalter/Makefile,v 1.2 2007/12/03 04:22:54 tgl Exp $

MODULE_big = parse_buckwalter
OBJS = parse_buckwalter.o
DATA_built = parse_buckwalter.sql
DATA = uninstall_parse_buckwalter.sql
REGRESS = parse_buckwalter

ifdef USE_PGXS
PG_CONFIG = pg_config
PGXS := $(shell $(PG_CONFIG) --pgxs)
include $(PGXS)
else
subdir = contrib/parse_buckwalter
top_builddir = ../..
include $(top_builddir)/src/Makefile.global
include $(top_srcdir)/contrib/contrib-global.mk
endif
