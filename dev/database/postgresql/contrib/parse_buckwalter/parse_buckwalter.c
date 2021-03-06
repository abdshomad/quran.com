/*-------------------------------------------------------------------------
 *
 * parse_buckwalter.c
 *	  Simple example of a text search parser
 *
 * Copyright (c) 2007-2010, PostgreSQL Global Development Group
 *
 * IDENTIFICATION
 *	  $PostgreSQL: pgsql/contrib/parse_buckwalter/parse_buckwalter.c,v 1.7 2010/01/02 16:57:32 momjian Exp $
 *
 *-------------------------------------------------------------------------
 */
#include "postgres.h"

#include "fmgr.h"

PG_MODULE_MAGIC;


/*
 * types
 */

/* self-defined type */
typedef struct
{
	char	   *buffer;			/* text to parse */
	int			len;			/* length of the text in buffer */
	int			pos;			/* position of the parser */
} ParserState;

/* copy-paste from wparser.h of tsearch2 */
typedef struct
{
	int			lexid;
	char	   *alias;
	char	   *descr;
} LexDescr;

/*
 * prototypes
 */
PG_FUNCTION_INFO_V1(buckwalter_start_parse);
Datum		buckwalter_start_parse(PG_FUNCTION_ARGS);

PG_FUNCTION_INFO_V1(buckwalter_get_next_token);
Datum		buckwalter_get_next_token(PG_FUNCTION_ARGS);

PG_FUNCTION_INFO_V1(buckwalter_end_parse);
Datum		buckwalter_end_parse(PG_FUNCTION_ARGS);

PG_FUNCTION_INFO_V1(buckwalter_get_token_types);
Datum		buckwalter_get_token_types(PG_FUNCTION_ARGS);

/*
 * functions
 */
Datum
buckwalter_start_parse(PG_FUNCTION_ARGS)
{
	ParserState *pst = (ParserState *) palloc0(sizeof(ParserState));

	pst->buffer = (char *) PG_GETARG_POINTER(0);
	pst->len = PG_GETARG_INT32(1);
	pst->pos = 0;

	PG_RETURN_POINTER(pst);
}

Datum
buckwalter_get_next_token(PG_FUNCTION_ARGS)
{
	ParserState *pst = (ParserState *) PG_GETARG_POINTER(0);
	char	  **t = (char **) PG_GETARG_POINTER(1);
	int		   *tlen = (int *) PG_GETARG_POINTER(2);
	int			type;

	*tlen = pst->pos;
	*t = pst->buffer + pst->pos;

	if ((pst->buffer)[pst->pos] == ' ')
	{
		/* blank type */
		type = 12;
		/* go to the next non-white-space character */
		while ((pst->buffer)[pst->pos] == ' ' &&
			   pst->pos < pst->len)
			(pst->pos)++;
	}
	else
	{
		/* word type */
		type = 3;
		/* go to the next white-space character */
		while ((pst->buffer)[pst->pos] != ' ' &&
			   pst->pos < pst->len)
			(pst->pos)++;
	}

	*tlen = pst->pos - *tlen;

	/* we are finished if (*tlen == 0) */
	if (*tlen == 0)
		type = 0;

	PG_RETURN_INT32(type);
}

Datum
buckwalter_end_parse(PG_FUNCTION_ARGS)
{
	ParserState *pst = (ParserState *) PG_GETARG_POINTER(0);

	pfree(pst);
	PG_RETURN_VOID();
}

Datum
buckwalter_get_token_types(PG_FUNCTION_ARGS)
{
	/*
	 * Remarks: - we have to return the blanks for headline reason - we use
	 * the same lexids like Teodor in the default word parser; in this way we
	 * can reuse the headline function of the default word parser.
	 */
	LexDescr   *descr = (LexDescr *) palloc(sizeof(LexDescr) * (2 + 1));

	/* there are only two types in this parser */
	descr[0].lexid = 3;
	descr[0].alias = pstrdup("word");
	descr[0].descr = pstrdup("Word");
	descr[1].lexid = 12;
	descr[1].alias = pstrdup("blank");
	descr[1].descr = pstrdup("Space symbols");
	descr[2].lexid = 0;

	PG_RETURN_POINTER(descr);
}
