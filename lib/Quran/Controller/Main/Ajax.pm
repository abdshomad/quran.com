package Quran::Controller::Main::Ajax;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

__PACKAGE__->config(
	default => 'text/javascript',
	map => {
		'text/javascript' => 'JSON'
	}
);

sub base :Chained('/main/_ayah') :PathPart('ajax') :CaptureArgs(0) {}
sub ajax :Chained('base') :PathPart('') :Args(0) :ActionClass('REST') {}

sub ajax_POST {
	my ($self, $c) = (shift, shift);
	my ($stash, $params) = ($c->stash, $c->request->data);

	my $content = $c->controller('Main')->ayah($c, 1);

	return $self->status_ok($c, entity => {
			 ayah => $content,
		  fonts => $stash->{fonts},
			 keys => $stash->{keys}
	});
}

__PACKAGE__->meta->make_immutable;

1;
