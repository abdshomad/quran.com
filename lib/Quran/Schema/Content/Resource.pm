# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Content::Resource;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('content.resource');

__PACKAGE__->add_columns(
	'resource_id'   => { data_type => 'integer', is_nullable => 0 },
	'source_id'     => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	'author_id'     => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	'language_code' => { data_type => 'text', is_foreign_key => 1, is_nullable => 0 },
	'resource_code' => { data_type => 'text', is_nullable => 0 },
	'type'          => { data_type => 'content.type', is_nullable => 0, size => 4 },
	'name'          => { data_type => 'text', is_nullable => 0 },
	'default'       => { data_type => 'boolean', default_value => \'true', is_nullable => 0 },
	'priority'      => { data_type => 'integer', default_value => 999, is_nullable => 0 },
);
__PACKAGE__->set_primary_key('resource_id');
__PACKAGE__->add_unique_constraint('language_code_type_resource_code', ['language_code', 'type', 'resource_code']);

__PACKAGE__->belongs_to('source' => 'Quran::Schema::Content::Source',
	{ 'foreign.source_id' => 'self.source_id' });

__PACKAGE__->belongs_to('author' => 'Quran::Schema::Content::Author',
	{ 'foreign.author_id' => 'self.author_id' });

__PACKAGE__->belongs_to('language' => 'Quran::Schema::I18N::Language',
	{ 'foreign.language_code' => 'self.language_code' });

__PACKAGE__->has_many('text' => 'Quran::Schema::Content::Text',
	{ 'foreign.resource_id' => 'self.resource_id' });

__PACKAGE__->has_many('tafsir' => 'Quran::Schema::Content::Tafsir',
	{ 'foreign.resource_id' => 'self.resource_id' });

__PACKAGE__->has_many('translation' => 'Quran::Schema::Content::Translation',
	{ 'foreign.resource_id' => 'self.resource_id' });

__PACKAGE__->has_many('transliteration' => 'Quran::Schema::Content::Transliteration',
	{ 'foreign.resource_id' => 'self.resource_id' });

1;
