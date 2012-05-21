# vim: ts=2 sw=2 noexpandtab
package Quran::Schema::Account::Share;

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->table('account.share');
__PACKAGE__->add_columns(
	'member_id' => { data_type => 'integer', is_foreign_key => 1, is_nullable => 0 },
	'api_key' => { data_type => 'text', is_foreign_key => 1, is_nullable => 0 },
	'token_access' => { data_type => 'text', is_nullable => 1 },
	'token_secret' => { data_type => 'text', is_nullable => 1 },
	'token_refresh' => { data_type => 'text', is_nullable => 1 },
	'token_expires' => { data_type => 'integer', is_nullable => 1 },
	'enabled' => { data_type => 'boolean', is_nullable => 0, default_value => \'false' },
);
__PACKAGE__->set_primary_key('member_id', 'api_key');

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

__PACKAGE__->has_many('queue' => 'Quran::Schema::Share::Queue', {
	'foreign.member_id' => 'self.member_id',
	'foreign.api_key' => 'self.api_key'
}, {
	join_type => 'left'
});

sub authorized {
	my ($self) = (shift);
	my ($authorized, $detail);

	$authorized = 0;

	if ($self->token_access) {
		$authorized = 1;

		if ($self->token_expires and $self->token_expires < time) {
			$authorized = 0;

			$detail->{expired} = 1;

			if ($self->token_refresh) {
				$detail->{refresh} = 'server';
			}
			else {
				$detail->{refresh} = 'browser';
			}
		}
	}

	return wantarray ? ($authorized, $detail) : $authorized;
}

sub state { { enabled => $_->enabled, map { ref eq 'HASH' ? %{ $_ } : ( defined ) ? ( authorized => $_ ) : () } $_->authorized } }
sub ready {
	my $self = shift;
	my $status = $self->state;

	return ( $status->{enabled} and ( $status->{authorized} or $status->{refresh} ) ) ? 1 : 0;
}

1;
