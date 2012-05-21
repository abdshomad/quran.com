package Quran::Controller::CSS;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub base :Chained('/base') :PathPart('css') :CaptureArgs(0) {}

sub css :Chained('base') :PathPart('dev.css') :Args(0) {
	my ($self, $c) = (shift, shift);
	my ($stash) = ($c->stash);


	my $file = $c->path_to(qw/dev css css.less/);
	my $output = `lessc $file`;

	$c->response->content_type('text/css');
	$c->response->body($output);
}

__PACKAGE__->meta->make_immutable;

1;
