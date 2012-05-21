# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Quran::Surah;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('quran.surah');

__PACKAGE__->add_columns(
	'surah_id',   { data_type => 'integer', is_nullable => 0 },
	'ayahs',      { data_type => 'integer', is_nullable => 0 },
	'bismillah',  { data_type => 'boolean', is_nullable => 0 },
	'revelation', { data_type => 'integer', is_nullable => 0 },
	'place',      { data_type => 'place', is_nullable => 0, size => 4 },
	'page_num',   { data_type => 'integer[]', is_nullable => 0 },
	'arabic',     { data_type => 'text', is_nullable => 0 },
	'english',    { data_type => 'text', is_nullable => 0 },
	'simple',     { data_type => 'text', is_nullable => 0 },
	'phoenetic',  { data_type => 'text', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('surah_id');

__PACKAGE__->has_many('ayah' => 'Quran::Schema::Quran::Ayah',
	{ 'foreign.surah_id' => 'self.surah_id' });

1;
