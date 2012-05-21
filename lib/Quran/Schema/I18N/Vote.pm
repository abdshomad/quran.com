package Quran::Schema::I18N::Vote;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('i18n.vote');

# TODO: Need trigger to enforce lexicon_id integrity w/ translation table

__PACKAGE__->add_columns(
	       'vote_id' => { data_type => 'integer', is_auto_increment => 1, is_nullable => 0, sequence => 'vote_vote_id_seq' },
	     'member_id' => { data_type => 'integer', is_nullable => 0 },
	    'lexicon_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	'translation_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
);
__PACKAGE__->set_primary_key('vote_id');
__PACKAGE__->add_unique_constraint('vote_lexicon_id_member_id', ['lexicon_id', 'member_id']);

__PACKAGE__->belongs_to('member' => 'Quran::Schema::Account::Member',
	{ 'foreign.member_id' => 'self.member_id' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

__PACKAGE__->belongs_to('lexicon' => 'Quran::Schema::I18N::Lexicon',
	{ 'foreign.lexicon_id' => 'self.lexicon_id' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

__PACKAGE__->belongs_to('translation' => 'Quran::Schema::I18N::Translation',
	{ 'foreign.translation_id' => 'self.translation_id' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

1;
