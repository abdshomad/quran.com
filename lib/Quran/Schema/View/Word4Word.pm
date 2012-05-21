# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::View::Word4Word;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table_class('DBIx::Class::ResultSource::View');
__PACKAGE__->table('view.word4word');
__PACKAGE__->result_source_instance->is_virtual(1);
__PACKAGE__->result_source_instance->view_definition('
	SELECT glyph.glyph_id AS glyph_id, word.word_id AS word_id, glyph.page_num AS page, type.name AS type, glyph.code_hex AS code, translation.value AS translation
	  FROM complex.glyph glyph JOIN quran.ayah ayah ON ayah.ayah_key = glyph.ayah_key JOIN complex.type type ON type.type_id = glyph.type_id
	  LEFT JOIN corpus.word word ON word.word_id = glyph.word_id
	  LEFT JOIN corpus.translation translation ON translation.word_id = word.word_id
	   AND translation.language_code = ? WHERE ayah.ayah_key = ? ORDER BY glyph.glyph_pos ASC');

__PACKAGE__->add_columns('glyph_id' => { data_type => 'integer' });
__PACKAGE__->add_columns('word_id' => { data_type => 'integer' });
__PACKAGE__->add_columns('page' => { data_type => 'integer' });
__PACKAGE__->add_columns('type' => { data_type => 'text' });
__PACKAGE__->add_columns('code' => { data_type => 'text' });
__PACKAGE__->add_columns('translation' => { data_type => 'text' });

__PACKAGE__->belongs_to('word' => 'Quran::Schema::Corpus::Word',
	{ 'foreign.word_id' => 'self.word_id' }, { join_type => 'LEFT' });

__PACKAGE__->belongs_to('glyph' => 'Quran::Schema::Corpus::Word',
	{ 'foreign.glyph_id' => 'self.glyph_id' }, { join_type => 'LEFT' });

1;
