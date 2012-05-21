# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::Controller::Sign::In;
use Moose;
use namespace::autoclean;
use DateTime;
use DateTime::Format::Pg;
use Email::Valid;

BEGIN { extends 'Catalyst::Controller::REST' }

# TODO: Update last_seen column upon sign in

sub index :Path :Args(0) :ActionClass('REST') {}

sub index_POST {
	my ($self, $c) = @_;
	my $params = $c->request->data;
	my $result = $self->authenticate($c, $params);
	return $self->status_ok($c, entity => $result);
}

sub authenticate :Private {
	my ($self, $c, $params) = (shift, shift, shift);

	$c->logout if $c->user_exists;

	if ($params->{login} and $params->{password}) {
		for (keys %{ $params }) {
			$params->{$_} =~ s/^\s+//;
			$params->{$_} =~ s/\s+$//;
		}
		my $member;
		if ($member = $c->authenticate({ login => $params->{login}, password => $params->{password} }) or
		    $member = $c->authenticate({ email => $params->{login}, password => $params->{password} })) {

			my $now = DateTime->now->set_time_zone("GMT");
			my $timestamp = DateTime::Format::Pg->format_timestamp_with_time_zone($now);

			$member->update({
				last_seen_ts => $timestamp,
				last_seen_ip => $c->request->address
			});

			if ($member->banned) {
				$c->logout;
				return { authenticated => 0, reason => 'banned', message => 'member has been banned' };
			}

			my %result = $member->get_columns;

			$result{lastmark} = {
				key => $member->lastmark->ayah_key,
				context => {
					range => $member->lastmark->context_range,
					state => $member->lastmark->context_state
				}
			} if $member->lastmark;

			$result{authenticated} = 1;

			my $time = DateTime::Format::Pg->parse_timestamp_with_time_zone($result{created});
			   $time = $time->add( days => 2 )->subtract_datetime($now);
			   $time = $time->days .($time->days == 1 ? ' day, ' : ' days, '). $time->hours .($time->hours == 1 ? ' hour, ' : ' hours, '). $time->minutes .($time->minutes == 1 ? ' minute and ' : ' minutes and '). $time->seconds .($time->seconds == 1 ? ' second' : ' seconds');

			$result{time} = $time;

			delete $result{$_} for qw/password updated created token last_seen_ip last_seen_ts member_id/;

			return \%result;
		}
	}
	return { authenticated => 0, reason => 'credentials', message => 'bad login and/or password' };
}

sub resend :Local :ActionClass('REST') {}
sub resend_POST {
	my ($self, $c) = (shift, shift);
	my $params = $c->request->data;
	if ($c->user_exists) {
		my $member = $c->user;
		$c->controller('Email')->queue($c, $member, qw/user verify/);
		return $self->status_ok($c, entity => { resent => 1 });
	}
	return $self->status_ok($c, entity => { resent => 0 });
}

sub change :Local :ActionClass('REST') {}
sub change_POST {
	my ($self, $c) = (shift, shift);
	my $params = $c->request->data;
	my $result = { changed => 0 };
	if ($c->user_exists and $params->{email}) {
		$params->{email} =~ s/^\s+//;
		$params->{email} =~ s/\s+$//;
		$result->{exception} = { message => 'provide an email address'    } unless $params->{email} ne '';
		$result->{exception} = { message => 'need a valid email address'  } unless $result->{exception} or Email::Valid->address( -address => $params->{email}, -tldcheck => 1 ) and $params->{email} !~ /\s/;
		$result->{exception} = { message => 'email address already taken' } unless $result->{exception} or $c->controller('Sign::Up')->is_available($c, { email => $params->{email} });
		return $self->status_ok($c, entity => $result) if $result->{exception};
		$c->user->update({ email => $params->{email} });
		$result->{changed} = 1;
		my $member = $c->user;
		$c->controller('Email')->queue($c, $member, qw/user verify/);
	}
	return $self->status_ok($c, entity => $result);
}

__PACKAGE__->meta->make_immutable;

1;
