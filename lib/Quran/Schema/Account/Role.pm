# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Account::Role;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('account.role');

__PACKAGE__->add_columns(
	'role_id' => { data_type => 'integer', is_auto_increment => 1, is_nullable => 0, sequence => 'role_role_id_seq' },
	'name'    => { data_type => 'text', is_nullable => 1 },
);
__PACKAGE__->set_primary_key('role_id');
__PACKAGE__->add_unique_constraint('role_name_key', ['name']);

__PACKAGE__->has_many('member_roles' => 'Quran::Schema::Account::MemberRole',
	{ 'foreign.role_id' => 'self.role_id' },
	{ cascade_copy => 0, cascade_delete => 0 });
__PACKAGE__->many_to_many('members' => 'member_roles', 'member');

1;
