package Quran::Controller::Search::Translation;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub search :Private {
	my ($self, $c, $query, $page) = @_;
	#$c->log->debug('SEARCH FROM TRANSLATION CALLED');

	my @token = $self->normalize($c, $query);
	#$c->log->debug('TOKENS '. join(' ', @token));

	$query = join ' ', @token;

	my @results = $c->model('DB::View::Search')->search(undef, {
		bind => ['translation:'. $c->stash->{language}->{language_code}, $query, $page]
	});

	return \@results;
}

sub normalize :Private {
	my ($self, $c, $query) = @_;

	$query =~ s/^[\s]+//;
	$query =~ s/[\s]+$//;

	my @token = split /[\s]+/, lc($query);
	my %token = map { $_ => 1 } @token;
	   @token = sort keys %token;

	return @token;
}

__PACKAGE__->meta->make_immutable;

1;
