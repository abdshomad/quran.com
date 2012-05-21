# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Quran::Surah;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('quran.surah');

__PACKAGE__->add_columns(
	'surah_id',         { data_type => 'integer', is_nullable => 0 },
	'num_ayahs',        { data_type => 'integer', is_nullable => 1 },
	'page_start',       { data_type => 'integer', is_nullable => 1 },
	'page_end',         { data_type => 'integer', is_nullable => 1 },
	'has_bismillah',    { data_type => 'boolean', is_nullable => 1 },
	'revelation_order', { data_type => 'integer', is_nullable => 1 },
	'revelation_place', { data_type => 'revelation_place_type', is_nullable => 1, size => 4 },
	'arabic',      { data_type => 'text', is_nullable => 1 },
	'english',     { data_type => 'text', is_nullable => 1 },
	'simple',      { data_type => 'text', is_nullable => 1 },
	'phoenetic',     { data_type => 'text', is_nullable => 1 },
);
__PACKAGE__->set_primary_key('surah_id');

__PACKAGE__->has_many('ayah' => 'Quran::Schema::Quran::Ayah',
	{ 'foreign.surah_id' => 'self.surah_id' });

__PACKAGE__->has_many('quran' => 'Quran::Schema::Content::Quran',
	{ 'foreign.surah_id' => 'self.surah_id' });

__PACKAGE__->has_many('translation' => 'Quran::Schema::Content::Translation',
	{ 'foreign.surah_id' => 'self.surah_id' });

__PACKAGE__->has_many('transliteration' => 'Quran::Schema::Content::Transliteration',
	{ 'foreign.surah_id' => 'self.surah_id' });

__PACKAGE__->has_many('tafsir' => 'Quran::Schema::Content::Tafsir',
	{ 'foreign.surah_id' => 'self.surah_id' });

__PACKAGE__->has_many('word' => 'Quran::Schema::Corpus::Word',
	{ 'foreign.surah_id' => 'self.surah_id' });

__PACKAGE__->has_many('glyph' => 'Quran::Schema::Complex::Glyph',
	{ 'foreign.surah_id' => 'self.surah_id' });

1;
