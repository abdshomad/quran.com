# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Account::Member;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('account.member');

__PACKAGE__->add_columns(
	'member_id'   => { data_type => 'integer', is_auto_increment => 1, is_nullable => 0, sequence => 'member_member_id_seq' },
	'login'        => { data_type => 'text', is_nullable => 0 },
	'password'     => { data_type => 'text', is_nullable => 0 },
	'name'         => { data_type => 'text', is_nullable => 0 },
	'email'        => { data_type => 'text', is_nullable => 0 },
	'token'         => { data_type => 'text', is_nullable => 0 },
	'verified'     => { data_type => 'boolean', default_value => \'false', is_nullable => 0 },
	'banned'       => { data_type => 'boolean', default_value => \'false', is_nullable => 0 },
	'purchased'    => { data_type => 'boolean', default_value => \'false', is_nullable => 0 },
	'last_seen_ts' => { data_type => 'timestamp with time zone', is_nullable => 1 },
	'last_seen_ip' => { data_type => 'cidr', is_nullable => 1 },
	'created'      => { data_type => 'timestamp with time zone', is_nullable => 1 },
	'updated'      => { data_type => 'timestamp with time zone', is_nullable => 1 },
);
__PACKAGE__->set_primary_key('member_id');
__PACKAGE__->add_unique_constraint('member_email_idx', ['email']);
__PACKAGE__->add_unique_constraint('member_login_idx', ['login']);
__PACKAGE__->add_unique_constraint('member_token_idx', ['token']);

__PACKAGE__->has_many('member_roles' => 'Quran::Schema::Account::MemberRole',
  { 'foreign.member_id' => 'self.member_id' },
  { cascade_copy => 0, cascade_delete => 0 });
__PACKAGE__->many_to_many('roles' => 'member_roles', 'role');

__PACKAGE__->has_many('transaction' => 'Quran::Schema::PayPal::Transaction',
	{ 'foreign.member_id' => 'self.member_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->has_many('queue' => 'Quran::Schema::Email::Queue',
	{ 'foreign.member_id' => 'self.member_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->has_many('bookmark' => 'Quran::Schema::Account::Bookmark',
	{ 'foreign.member_id' => 'self.member_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->has_many('tag' => 'Quran::Schema::Account::Tag',
	{ 'foreign.member_id' => 'self.member_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->has_many('share' => 'Quran::Schema::Account::Share',
	{ 'foreign.member_id' => 'self.member_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->might_have('lastmark' => 'Quran::Schema::Account::Lastmark',
  { 'foreign.member_id' => 'self.member_id' },
  { cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->might_have('session' => 'Quran::Schema::Account::Session',
  { 'foreign.member_id' => 'self.member_id' },
  { cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->has_many('note' => 'Quran::Schema::Account::Note',
	{ 'foreign.member_id' => 'self.member_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->has_many('setting' => 'Quran::Schema::Account::Setting',
	{ 'foreign.member_id' => 'self.member_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->has_many('_followed' => 'Quran::Schema::Account::Follower',
	{ 'foreign.follower_id' => 'self.member_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->has_many('_follower' => 'Quran::Schema::Account::Follower',
	{ 'foreign.followed_id' => 'self.member_id' },
	{ cascade_copy => 0, cascade_delete => 0 });

__PACKAGE__->many_to_many('followed', '_followed', 'followed');
__PACKAGE__->many_to_many('follower', '_follower', 'follower');

sub mutual {
	my $self = shift;
	my $mutual;

	my $set = $self->followed->search_rs({
		'followed_2.member_id' => $self->member_id
	}, {
		join => { _followed => 'followed' },
		columns => { login => 'followed.login' }
	});

	while (my $result = $set->next) {
		$mutual->{ $result->get_column('login') } = 1;
	}

	return $mutual;
}

1;
