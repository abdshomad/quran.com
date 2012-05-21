package Quran::Controller::Main::Ajax::Scroll;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

=head1 NAME

Quran::Controller::Main::Ajax::Scroll - Catalyst Controller

=head1 DESCRIPTION

Catalyst Controller for server-side handling of client-side infiniteScroll module.
NOTE: This module is on hold because of FOUT.

=head1 METHODS

=cut


=head2 index

=cut

sub base :Chained('/main/_ayahs') :PathPart('ajax/scroll') :CaptureArgs(0) {}
sub scroll :Chained('base') :PathPart('') :Args(0) :ActionClass('REST') {}

sub scroll_POST {
	my ($self, $c) = (shift, shift);
	my $params = $c->request->data;

	my $content = $c->controller('Main')->view($c, 1);

	return $self->status_ok($c, entity => {
		content => $content,
		 corpus => $c->stash->{corpus},
		  fonts => $c->stash->{fonts}
	});
}

=head1 AUTHOR

Nour Sharabash <nour@quran.com>

=head1 LICENSE

Copyright (c) 2011 by Nour Sharabash

=cut

__PACKAGE__->meta->make_immutable;

1;
