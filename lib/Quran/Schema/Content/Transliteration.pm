# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Content::Transliteration;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('content.transliteration');

__PACKAGE__->add_columns(
	'resource_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
  'ayah_key'    => { data_type => 'text', is_foreign_key => 1, is_nullable => 0 },
	'text'        => { data_type => 'text', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('resource_id', 'ayah_key');

__PACKAGE__->belongs_to('resource' => 'Quran::Schema::Content::Resource',
	{ 'foreign.resource_id' => 'self.resource_id' });

__PACKAGE__->belongs_to('ayah' => 'Quran::Schema::Quran::Ayah',
	{ 'foreign.ayah_key' => 'self.ayah_key' });

1;
