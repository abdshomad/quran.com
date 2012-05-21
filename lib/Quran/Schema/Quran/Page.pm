# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Quran::Page;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('quran.page');

__PACKAGE__->add_columns(
	'surah_id'   => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	'page_num', { data_type => 'integer', is_nullable => 0 },
	'ayah_num', { data_type => 'integer[]', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('surah_id', 'page_num');

__PACKAGE__->belongs_to('surah' => 'Quran::Schema::Quran::Surah',
	{ 'foreign.surah_id' => 'self.surah_id' });

1;
