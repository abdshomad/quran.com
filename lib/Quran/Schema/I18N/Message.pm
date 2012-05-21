package Quran::Schema::I18N::Message;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('i18n.message');

__PACKAGE__->add_columns(
	'message_id' => { data_type => 'integer', is_auto_increment => 1, is_nullable => 0, sequence => 'message_message_id_seq' },
	     'value' => { data_type => 'text', is_nullable => 0 },
	   'context' => { data_type => 'text', default_value => '', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('message_id');
__PACKAGE__->add_unique_constraint('message_value_context', ['value', 'context']);

__PACKAGE__->has_many('lexicon' => 'Quran::Schema::I18N::Lexicon',
	{ 'foreign.message_id' => 'self.message_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

1;
