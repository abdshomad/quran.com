# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::View::Word2Lemma;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table_class('DBIx::Class::ResultSource::View');
__PACKAGE__->table('view.word2lemma');
__PACKAGE__->result_source_instance->is_virtual(1);
__PACKAGE__->result_source_instance->view_definition('
  SELECT DISTINCT unnest(array_cat(arabic, variant)) AS word, lemma
    FROM (SELECT ARRAY[arabic]::text[] AS arabic, (CASE WHEN array_length(variant, 1) > 1 THEN (CASE WHEN variant[1] != arabic THEN ARRAY[variant[1]]::text[] ELSE ARRAY[variant[2]]::text[] END) END) AS variant, lemma
            FROM (SELECT arabic, ts_lexize(\'quran.buckwalter_simple\', arabic) AS variant, lemma
                    FROM (SELECT arabic, lemma.buckwalter AS lemma
                            FROM corpus.word, corpus.arabic, corpus.lemma, (SELECT arabic
                                                                              FROM (SELECT arabic.buckwalter AS arabic, lemma.buckwalter AS lemma
                                                                                      FROM corpus.word, corpus.arabic, corpus.lemma
                                                                                     WHERE word.arabic_id = arabic.arabic_id
                                                                                       AND word.lemma_id = lemma.lemma_id
                                                                                     GROUP BY arabic.buckwalter, lemma.buckwalter) sub
                                                                             GROUP BY arabic HAVING count(*) = 1) sub
                           WHERE word.arabic_id = arabic.arabic_id
                             AND word.lemma_id = lemma.lemma_id
                             AND arabic.buckwalter = sub.arabic
                             AND sub.arabic != lemma.buckwalter) sub) sub) sub
');
__PACKAGE__->add_columns(
	'word'  => { data_type => 'text' },
	'lemma' => { data_type => 'text' },
);

1;
