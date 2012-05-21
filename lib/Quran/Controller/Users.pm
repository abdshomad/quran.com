# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::Controller::Users;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub base :Chained('/') :PathPart('u') :CaptureArgs(0) {}

sub user :Chained('base') :PathPart('') :CaptureArgs(1) {
	my ($self, $c, $user) = @_;
	$c->stash->{_user_} = $user;
}

__PACKAGE__->meta->make_immutable;

1;
