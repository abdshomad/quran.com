# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::View::Word;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table_class('DBIx::Class::ResultSource::View');
__PACKAGE__->table('view.word');
__PACKAGE__->result_source_instance->is_virtual(1);
__PACKAGE__->result_source_instance->view_definition('SELECT ayah.ayah_num AS I, me.glyph_pos AS j, me.page_num AS page, me.code_hex AS code, type.name AS type, word.word_pos AS position, root.value AS root, lemma.value AS lemma, arabic.value AS arabic, word.word_id AS id, translation.language_code AS language_code, translation.value AS translation FROM complex.glyph me JOIN quran.ayah ayah ON ayah.ayah_key = me.ayah_key JOIN complex.type type ON type.type_id = me.type_id LEFT JOIN corpus.word word ON word.word_id = me.word_id LEFT JOIN corpus.root root ON root.root_id = word.root_id LEFT JOIN corpus.lemma lemma ON lemma.lemma_id = word.lemma_id LEFT JOIN corpus.arabic arabic ON arabic.arabic_id = word.arabic_id LEFT JOIN corpus.translation translation ON translation.word_id = word.word_id AND translation.language_code = ? WHERE ayah.surah_id = ? ORDER BY ayah.ayah_num ASC, me.glyph_pos ASC, translation.language_code ASC');
__PACKAGE__->add_columns('i' => { data_type => 'integer' });
__PACKAGE__->add_columns('j' => { data_type => 'integer' });
__PACKAGE__->add_columns('page' => { data_type => 'integer' });
__PACKAGE__->add_columns('position' => { data_type => 'integer' });
__PACKAGE__->add_columns('id' => { data_type => 'integer' });
__PACKAGE__->add_columns('code' => { data_type => 'text' });
__PACKAGE__->add_columns('type' => { data_type => 'text' });
__PACKAGE__->add_columns('root' => { data_type => 'text' });
__PACKAGE__->add_columns('lemma' => { data_type => 'text' });
__PACKAGE__->add_columns('arabic' => { data_type => 'text' });
__PACKAGE__->add_columns('language_code' => { data_type => 'text' });
__PACKAGE__->add_columns('translation' => { data_type => 'text' });

1;
