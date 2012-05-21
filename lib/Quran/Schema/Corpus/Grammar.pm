# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Corpus::Grammar;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('corpus.grammar');

__PACKAGE__->add_columns(
  'grammar_id', { data_type => 'integer', is_auto_increment => 1, is_nullable => 0, sequence => 'grammar_grammar_id_seq' },
	'value',      { data_type => 'text', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('grammar_id');
__PACKAGE__->add_unique_constraint('grammar_value_key', ['value']);

__PACKAGE__->has_many('word' => 'Quran::Schema::Corpus::Word',
	{ 'foreign.root_id' => 'self.root_id' });

1;
