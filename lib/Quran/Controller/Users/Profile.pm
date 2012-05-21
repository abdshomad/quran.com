# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::Controller::Users::Profile;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub base :Chained('/users/user') :PathPart('profile') :CaptureArgs(0) {}
sub view :Chained('base') :PathPart('') :Args(0) {
	my ($self, $c) = @_;
	$c->stash->{template} = 'users/profile.mhtml';
}

__PACKAGE__->meta->make_immutable;

1;
