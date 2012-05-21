package Quran::Schema::I18N::Translation;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('i18n.translation');

__PACKAGE__->add_columns(
	'translation_id' => { data_type => 'integer', is_auto_increment => 1, is_nullable => 0, sequence => 'i18n.translation_translation_id_seq' },
	    'lexicon_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	     'member_id' => { data_type => 'integer', is_nullable => 0 },
	         'value' => { data_type => 'text', is_nullable => 0 },
	       'created' => { data_type => 'timestamp with time zone', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('translation_id');
__PACKAGE__->add_unique_constraint('translation_lexicon_id_value', ['lexicon_id', 'value']);

__PACKAGE__->belongs_to('member' => 'Quran::Schema::Account::Member',
	{ 'foreign.member_id' => 'self.member_id' },
	{ is_deferrable => 1, on_delete => 'SET NULL', on_update => 'CASCADE' });

__PACKAGE__->belongs_to('lexicon' => 'Quran::Schema::I18N::Lexicon',
	{ 'foreign.lexicon_id' => 'self.lexicon_id' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

__PACKAGE__->has_many('vote' => 'Quran::Schema::I18N::Vote',
	{ 'foreign.translation_id' => 'self.translation_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

1;
