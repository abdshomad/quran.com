# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Email::Param;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('email.param');

__PACKAGE__->add_columns(
	'queue_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	     'key' => { data_type => 'text', is_nullable => 0 },
	   'value' => { data_type => 'text', is_nullable => 0 },
);

__PACKAGE__->set_primary_key('queue_id', 'key');

__PACKAGE__->belongs_to('queue' => 'Quran::Schema::Email::Queue',
	{ 'foreign.queue_id' => 'self.queue_id' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

1;
