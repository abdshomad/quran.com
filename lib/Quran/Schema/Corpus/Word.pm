# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Corpus::Word;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('corpus.word');

__PACKAGE__->add_columns(
	'word_id'    => { data_type => 'integer', is_nullable => 0 },
	'word_pos'   => { data_type => 'integer', is_nullable => 1 },
	'page_num'   => { data_type => 'integer', is_nullable => 1 },
	'arabic_id'  => { data_type => 'integer', is_foreign_key => 1, is_nullable => 1 },
	'lemma_id'   => { data_type => 'integer', is_foreign_key => 1, is_nullable => 1 },
	'root_id'    => { data_type => 'integer', is_foreign_key => 1, is_nullable => 1 },
	'grammar_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 1 },
  'ayah_key'   => { data_type => 'text', is_foreign_key => 1, is_nullable => 0 },
);
__PACKAGE__->set_primary_key('word_id');
__PACKAGE__->add_unique_constraint('word_pos_ayah_key', ['word_pos', 'ayah_key']);

__PACKAGE__->belongs_to('ayah' => 'Quran::Schema::Quran::Ayah',
	{ 'foreign.ayah_key' => 'self.ayah_key' });

__PACKAGE__->has_many('glyph' => 'Quran::Schema::Complex::Glyph',
	{ 'foreign.word_id' => 'self.word_id' });

__PACKAGE__->belongs_to('arabic' => 'Quran::Schema::Corpus::Arabic',
	{ 'foreign.arabic_id' => 'self.arabic_id' });

__PACKAGE__->belongs_to('lemma' => 'Quran::Schema::Corpus::Lemma',
	{ 'foreign.lemma_id' => 'self.lemma_id' }, { join_type => 'LEFT' });

__PACKAGE__->belongs_to('root' => 'Quran::Schema::Corpus::Root',
	{ 'foreign.root_id' => 'self.root_id' }, { join_type => 'LEFT' });

__PACKAGE__->belongs_to('grammar' => 'Quran::Schema::Corpus::Grammar',
	{ 'foreign.grammar_id' => 'self.grammar_id' }, { join_type => 'LEFT' });

__PACKAGE__->has_many('translation' => 'Quran::Schema::Corpus::Translation',
	{ 'foreign.word_id' => 'self.word_id' });

1;
