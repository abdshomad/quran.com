# $PostgreSQL: pgsql/contrib/dict_buckwalter_xsyn/Makefile,v 1.3 2007/12/02 21:15:38 tgl Exp $

MODULE_big = dict_buckwalter_xsyn
OBJS = dict_buckwalter_xsyn.o
DATA_built = dict_buckwalter_xsyn.sql
DATA = uninstall_dict_buckwalter_xsyn.sql
REGRESS = dict_buckwalter_xsyn

ifdef USE_PGXS
PG_CONFIG = pg_config
PGXS := $(shell $(PG_CONFIG) --pgxs)
include $(PGXS)
else
subdir = contrib/dict_buckwalter_xsyn
top_builddir = ../..
include $(top_builddir)/src/Makefile.global
include $(top_srcdir)/contrib/contrib-global.mk
endif
