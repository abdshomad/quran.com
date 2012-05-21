# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::Controller::Me;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub base :Chained('/base') :PathPart('me') :CaptureArgs(0) {
	my ($self, $c) = (shift, shift);
	my ($stash) = ($c->stash);

	return $c->detach('/default')
		unless $c->account;

	$stash->{account} = { $c->account->get_columns };
}

sub capture :Chained('/base') :PathPart('') :CaptureArgs(1) :Match('^[\w.]{4,25}$') {
	my ($self, $c, $login) = (shift, shift, shift);
	my ($stash, $account) = ($c->stash);

	($login = lc $login) =~ s/^[\s]*(.*)[\s]*$/$1/;
	$account = $c->model('DB::Account::Member')->find({ login => $login });

	return $c->detach('/default')
		unless $account;

	$stash->{account} = { $account->get_columns };
}

__PACKAGE__->meta->make_immutable;

1;
