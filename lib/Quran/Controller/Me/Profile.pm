# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::Controller::Me::Profile;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub _from_base    :Chained('/me/base')    :PathPart('') :Args(0) { shift->profile(@_) }
sub _from_capture :Chained('/me/capture') :PathPart('') :Args(0) { shift->profile(@_) }

sub profile :Private {
	my ($self, $c) = @_;
	my ($stash) = ($c->stash);

	$stash->{static} = { js => 1, css => 1 };
	$stash->{include} = { head => 1, body => 1, foot => 1 };
	$stash->{options} = $c->model('Options')->options($c);
	$stash->{template} = 'screen/me/profile.mhtml';
	$stash->{view} = 'profile';
}

__PACKAGE__->meta->make_immutable;

1;
