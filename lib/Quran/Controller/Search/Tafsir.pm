package Quran::Controller::Search::Tafsir;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub index :Path :Args(0) {
	my ( $self, $c ) = @_;

	$c->response->body('Matched Quran::Controller::Search::Tafsir in Search::Tafsir.');
}

__PACKAGE__->meta->make_immutable;

1;
