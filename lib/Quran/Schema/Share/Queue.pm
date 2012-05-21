# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Share::Queue;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('share.queue');

__PACKAGE__->add_columns(
	'queue_id' => { data_type => 'integer', is_auto_increment => 1, is_nullable => 0, sequence => 'queue_queue_id_seq' },
	'member_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	'api_key' => { data_type => 'text', is_foreign_key => 1, is_nullable => 0 },
	'request' => { data_type => 'text', is_nullable => 0 },
	'created' => { data_type => 'timestamp with time zone', is_nullable => 1 },
);

__PACKAGE__->set_primary_key('queue_id');

__PACKAGE__->belongs_to('share' => 'Quran::Schema::Account::Share', {
	'foreign.member_id' => 'self.member_id',
	'foreign.api_key' => 'self.api_key'
}, {
	join_type => 'left'
});

__PACKAGE__->belongs_to('member' => 'Quran::Schema::Account::Member', {
	'foreign.member_id' => 'self.member_id'
}, {
	join_type => 'left'
});

__PACKAGE__->belongs_to('api' => 'Quran::Schema::Share::API', {
	'foreign.api_key' => 'self.api_key'
}, {
	join_type => 'left',
});

1;
