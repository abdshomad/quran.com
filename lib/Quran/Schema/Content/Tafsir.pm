# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Content::Tafsir;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('content.tafsir');

__PACKAGE__->add_columns(
	'tafsir_id'    => { data_type => 'integer', is_auto_increment => 1, is_nullable => 0, sequence => 'tafsir_tafsir_id_seq'  },
	'resource_id'  => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	'text'         => { data_type => 'text', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('tafsir_id');

__PACKAGE__->belongs_to('resource' => 'Quran::Schema::Content::Resource',
	{ 'foreign.resource_id' => 'self.resource_id' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

__PACKAGE__->has_many('tafsir_ayah' => 'Quran::Schema::Content::TafsirAyah',
	{ 'foreign.tafsir_id' => 'self.tafsir_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->many_to_many('ayah' => 'tafsir_ayah', 'ayah');

1;
