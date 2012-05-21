# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Email::Queue;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('email.queue');

__PACKAGE__->add_columns(
	 'queue_id' => { data_type => 'integer', is_auto_increment => 1, is_nullable => 0, sequence => 'queue_queue_id_seq' },
	'member_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	 'template' => { data_type => 'text', is_nullable => 0 },
	  'created' => { data_type => 'timestamp with time zone', is_nullable => 1 },
);

__PACKAGE__->set_primary_key('queue_id');

__PACKAGE__->has_many('param' => 'Quran::Schema::Email::Param',
	{ 'foreign.queue_id' => 'self.queue_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->belongs_to('member' => 'Quran::Schema::Account::Member',
	{ 'foreign.member_id' => 'self.member_id' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

1;
