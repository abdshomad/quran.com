# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Complex::Type;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('complex.type');

__PACKAGE__->add_columns(
	'type_id',     { data_type => 'integer', is_nullable => 0 },
	'name',        { data_type => 'text', is_nullable => 1 },
	'description', { data_type => 'text', is_nullable => 1 },
	'parent_id',   { data_type => 'integer', is_foreign_key => 1, is_nullable => 1 },
);
__PACKAGE__->set_primary_key('type_id');
__PACKAGE__->add_unique_constraint('glyph_type_name_parent_id_key', ['name', 'parent_id']);

__PACKAGE__->belongs_to('parent' => 'Quran::Schema::Complex::Type',
	{ 'foreign.type_id' => 'self.parent_id' });

__PACKAGE__->has_many('children' => 'Quran::Schema::Complex::Type',
	{ 'foreign.parent_id' => 'self.type_id' });

__PACKAGE__->has_many('glyph' => 'Quran::Schema::Complex::Glyph',
	{ 'foreign.type_id' => 'self.type_id' });

1;
