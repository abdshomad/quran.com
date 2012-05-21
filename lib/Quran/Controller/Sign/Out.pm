# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::Controller::Sign::Out;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub index :Path :Args(0) {
	my ($self, $c) = @_;
	$c->logout;
	$c->response->redirect($c->request->referer);
}

__PACKAGE__->meta->make_immutable;

1;

