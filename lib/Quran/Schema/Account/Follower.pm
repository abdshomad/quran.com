# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Account::Follower;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('account.follower');

__PACKAGE__->add_columns(
	'follower_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	'followed_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
);
__PACKAGE__->set_primary_key('follower_id', 'followed_id');

__PACKAGE__->belongs_to('followed' => 'Quran::Schema::Account::Member',
	{ 'foreign.member_id' => 'self.followed_id' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

__PACKAGE__->belongs_to('follower' => 'Quran::Schema::Account::Member',
	{ 'foreign.member_id' => 'self.follower_id' },
	{ is_deferrable => 1, on_delete => 'CASCADE', on_update => 'CASCADE' });

1;
