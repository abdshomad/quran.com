package Quran::Schema::I18N::Lexicon;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('i18n.lexicon');

__PACKAGE__->add_columns(
	         'lexicon_id' => { data_type => 'integer', is_auto_increment => 1, is_nullable => 0, sequence => 'lexicon_lexicon_id_seq' },
	         'message_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	      'language_code' => { data_type => 'text', is_foreign_key => 1, is_nullable => 0 },
	     'translation_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 1 },
	       'vote_enabled' => { data_type => 'boolean', default_value => \'true', is_nullable => 0 },
	     'vote_automatic' => { data_type => 'boolean', default_value => \'true', is_nullable => 0 },
	'vote_translation_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 1 },
);
__PACKAGE__->set_primary_key('lexicon_id');
__PACKAGE__->add_unique_constraint('lexicon_message_id_language_code', ['message_id', 'language_code']);

__PACKAGE__->belongs_to('message' => 'Quran::Schema::I18N::Message',
	{ 'foreign.message_id' => 'self.message_id' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

__PACKAGE__->belongs_to('language' => 'Quran::Schema::I18N::Language',
	{ 'foreign.language_code' => 'self.language_code' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

__PACKAGE__->belongs_to('translation' => 'Quran::Schema::I18N::Translation',
	{ 'foreign.translation_id' => 'self.translation_id' },
	{ is_deferrable => 1, on_delete => 'SET NULL', on_update => 'CASCADE' });

__PACKAGE__->belongs_to('vote_translation' => 'Quran::Schema::I18N::Translation',
	{ 'foreign.translation_id' => 'self.vote_translation_id' },
	{ is_deferrable => 1, on_delete => 'SET NULL', on_update => 'CASCADE' });

__PACKAGE__->has_many('translations' => 'Quran::Schema::I18N::Translation',
	{ 'foreign.lexicon_id' => 'self.lexicon_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->has_many('vote' => 'Quran::Schema::I18N::Vote',
	{ 'foreign.translation_id' => 'self.translation_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

1;
