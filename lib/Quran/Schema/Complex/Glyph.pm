# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Complex::Glyph;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('complex.glyph');

__PACKAGE__->add_columns(
	'glyph_id'   => { data_type => 'integer', is_nullable => 0 },
	'glyph_pos'  => { data_type => 'integer', is_nullable => 1 },
	'page_num'   => { data_type => 'integer', is_nullable => 1 },
	'line_num'   => { data_type => 'integer', is_nullable => 1 },
	'glyph_code' => { data_type => 'integer', is_nullable => 1 },
	'code_dec'   => { data_type => 'integer', is_nullable => 1 },
	'code_hex'   => { data_type => 'text', is_nullable => 1 },
	'type_id'    => { data_type => 'integer', is_foreign_key => 1, is_nullable => 1 },
	'word_id'    => { data_type => 'integer', is_foreign_key => 1, is_nullable => 1 },
  'ayah_key'   => { data_type => 'text', is_foreign_key => 1, is_nullable => 0 },
);
__PACKAGE__->set_primary_key('glyph_id');
__PACKAGE__->add_unique_constraint(
	'ayah_key_glyph_pos',
	['ayah_key', 'glyph_pos'],
);

__PACKAGE__->belongs_to('ayah' => 'Quran::Schema::Quran::Ayah',
	{ 'foreign.ayah_key' => 'self.ayah_key' });

__PACKAGE__->belongs_to('type' => 'Quran::Schema::Complex::Type',
	{ 'foreign.type_id' => 'self.type_id' });

__PACKAGE__->belongs_to('word' => 'Quran::Schema::Corpus::Word',
	{ 'foreign.word_id' => 'self.word_id' }, { join_type => 'left' });

1;
