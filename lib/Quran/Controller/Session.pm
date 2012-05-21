package Quran::Controller::Session;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

sub base :Chained('/base') :PathPart('session') :CaptureArgs(0) {
	my ($self, $c) = (shift, shift);
	my ($params, $stash, $session, $model) = ($c->request->data, $c->stash, $c->session, $c->model('Session'));

	if (defined $params->{session}
			and ref $params->{session} eq 'HASH'
			and $model->valid($params->{session})) {
		$model->extend($params->{session}, $session);
		$stash->{session}->{saved} = 1;
	}
	else {
		$stash->{session}->{saved} = 0;
	}
}

sub session :Chained('base') :PathPart('') :Args(0) :ActionClass('REST') {}

sub session_POST {
	my ($self, $c) = (shift, shift);
	my ($params, $stash) = ($c->request->data, $c->stash);
	my ($result) = ($stash->{session});

	$self->status_ok($c, entity => $result);
}

1;
