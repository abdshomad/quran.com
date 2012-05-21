# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Quran::Ayah;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('quran.ayah');

__PACKAGE__->add_columns(
	'ayah_index' => { data_type => 'integer', is_nullable => 0 },
	'surah_id'   => { data_type => 'integer', is_foreign_key => 1, is_nullable => 1 },
	'ayah_num'   => { data_type => 'integer', is_nullable => 1 },
	'has_sajdah' => { data_type => 'sajdah_type', is_nullable => 1, size => 4 },
	'page_num'   => { data_type => 'integer', is_nullable => 1 },
	'juz_num'    => { data_type => 'integer', is_nullable => 1 },
	'hizb_num'   => { data_type => 'integer', is_nullable => 1 },
	'rub_num'    => { data_type => 'integer', is_nullable => 1 },
	'text'       => { data_type => 'text', is_nullable => 1 },
  'ayah_key'   => { data_type => 'text', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('ayah_key');
__PACKAGE__->add_unique_constraint('ayah_index_key', ['ayah_index']);
__PACKAGE__->add_unique_constraint('surah_ayah_key', ['surah_id', 'ayah_num']);

__PACKAGE__->has_many('texts' => 'Quran::Schema::Content::Text', # should be 'texts', left as is for now
	{ 'foreign.ayah_key' => 'self.ayah_key' });

__PACKAGE__->has_many('translations' => 'Quran::Schema::Content::Translation', # should be 'translations', left as is for now
	{ 'foreign.ayah_key' => 'self.ayah_key' });

__PACKAGE__->has_many('transliterations' => 'Quran::Schema::Content::Transliteration', # should be 'transliterations', left as is for now
	{ 'foreign.ayah_key' => 'self.ayah_key' });

__PACKAGE__->has_many('tafsir_ayahs' => 'Quran::Schema::Content::TafsirAyah',
	{ 'foreign.ayah_key' => 'self.ayah_key' },
	{ cascade_copy => 0, cascade_delete => 0 });
__PACKAGE__->many_to_many('tafsirs' => 'tafsir_ayahs', 'tafsir');

__PACKAGE__->has_many('words' => 'Quran::Schema::Corpus::Word', # should be 'words', left as is for now
	{ 'foreign.ayah_key' => 'self.ayah_key' });

__PACKAGE__->has_many('glyphs' => 'Quran::Schema::Complex::Glyph', # should be 'glyphs', left as is for now
	{ 'foreign.ayah_key' => 'self.ayah_key' });

__PACKAGE__->belongs_to('surah' => 'Quran::Schema::Quran::Surah',
	{ 'foreign.surah_id' => 'self.surah_id' });

1;
