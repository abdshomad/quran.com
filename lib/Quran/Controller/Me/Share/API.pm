package Quran::Controller::Me::Share::API;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

sub capture :Chained('/me/share/base') :PathPart('api') :CaptureArgs(1) {
	my ($self, $c, $key) = (shift, shift, shift);
	my ($stash) = ($c->stash);
	my ($model, $controller);

	$model = $c->account->share->find({ api_key => $key }, { key => 'primary' });

	return $c->detach('/default')
		unless $model;

	$controller = $c->controller('Share::'. ( join '::', map { (uc substr $_, 0, 1) . lc substr $_, 1 } split /_/, $key ));

	return $c->detach('/default')
		unless $controller;

	$stash->{model} = $model;
	$stash->{controller} = $controller;
}

sub method :Chained('capture') :PathPart('') :Args(1) :ActionClass('REST') {
	my ($self, $c, $method) = (shift, shift, shift);
	my ($stash) = ($c->stash);

	return $c->detach('/default')
		unless $stash->{controller}->can($method);

	$stash->{method} = $method;
}

sub method_GET {
	my ($self, $c) = (shift, shift);
	my ($stash) = ($c->stash);

	my ($controller, $method, $model) = ($stash->{controller}, $stash->{method}, $stash->{model});

	my $result = $controller->$method($c, $model);

	$self->status_ok($c, entity => {
		model => $model,
		controller => $controller,
		method => $method,
		result => $result
	});
}

__PACKAGE__->meta->make_immutable;

1;
