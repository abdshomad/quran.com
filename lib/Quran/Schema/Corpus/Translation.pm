# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Corpus::Translation;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('corpus.translation');

__PACKAGE__->add_columns(
	'translation_id' => { data_type => 'integer', is_nullable => 0 },
	'language_code'  => { data_type => 'text', is_foreign_key => 1, is_nullable => 0 },
	'word_id'        => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	'value'          => { data_type => 'text', is_nullable => 1 },
);
__PACKAGE__->set_primary_key('translation_id');
__PACKAGE__->add_unique_constraint('word_translation_word_id_language_key', ['word_id', 'language_code']);

__PACKAGE__->belongs_to('word' => 'Quran::Schema::Corpus::Word',
	{ 'foreign.word_id' => 'self.word_id' });

__PACKAGE__->belongs_to('language' => 'Quran::Schema::I18N::Language',
	{ 'foreign.language_code' => 'self.language_code' });

1;
