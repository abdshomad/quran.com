# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Corpus::Root;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('corpus.root');

__PACKAGE__->add_columns(
  'root_id',    { data_type => 'integer', is_auto_increment => 1, is_nullable => 0, sequence => 'root_root_id_seq' },
	'value',      { data_type => 'text', is_nullable => 0 },
	'normalized', { data_type => 'text', is_nullable => 1 },
	'buckwalter', { data_type => 'text', is_nullable => 1 },
);
__PACKAGE__->set_primary_key('root_id');
__PACKAGE__->add_unique_constraint('word_root_value_key', ['value']);

__PACKAGE__->has_many('word' => 'Quran::Schema::Corpus::Word',
	{ 'foreign.root_id' => 'self.root_id' });

1;
