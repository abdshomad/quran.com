# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Content::TafsirAyah;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('content.tafsir_ayah');

__PACKAGE__->add_columns(
  'tafsir_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
  'ayah_key'  => { data_type => 'text', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('tafsir_id', 'ayah_key');

__PACKAGE__->belongs_to('tafsir' => 'Quran::Schema::Content::Tafsir',
	{ 'foreign.tafsir_id' => 'self.tafsir_id' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

__PACKAGE__->belongs_to('ayah' => 'Quran::Schema::Quran::Ayah',
	{ 'foreign.ayah_key' => 'self.ayah_key' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

1;
