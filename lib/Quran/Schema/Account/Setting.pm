# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Account::Setting;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('account.setting');

__PACKAGE__->add_columns(
	'member_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	'key'        => { data_type => 'text', is_nullable => 0 },
	'value'      => { data_type => 'text', is_nullable => 0 },
);
__PACKAGE__->set_primary_key('member_id', 'key');

__PACKAGE__->belongs_to('member' => 'Quran::Schema::Account::Member',
	{ 'foreign.member_id' => 'self.member_id' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

1;
