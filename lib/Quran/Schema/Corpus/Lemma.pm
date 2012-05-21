# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Corpus::Lemma;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('corpus.lemma');

__PACKAGE__->add_columns(
  'lemma_id',   { data_type => 'integer', is_auto_increment => 1, is_nullable => 0, sequence => 'lemma_lemma_id_seq' },
	'value',      { data_type => 'text', is_nullable => 0 },
	'normalized', { data_type => 'text', is_nullable => 1 },
	'buckwalter', { data_type => 'text', is_nullable => 1 },
);
__PACKAGE__->set_primary_key('lemma_id');
__PACKAGE__->add_unique_constraint('word_lemma_value_key', ['value']);

__PACKAGE__->has_many('word' => 'Quran::Schema::Corpus::Word',
	{ 'foreign.lemma_id' => 'self.lemma_id' });

1;
