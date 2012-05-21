package Quran::Controller::Search::Transliteration;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub search :Private {
	my ($self, $c, $query, $page) = @_;
	#$c->log->debug('SEARCH FROM TRANSLITERATION CALLED');

	my @token = $self->normalize($c, $query);
	#$c->log->debug('TOKENS '. join(' ', @token));

	$query = join ' ', @token;

	my @results = $c->model('DB::View::Search')->search(undef, {
		bind => ['transliteration', $query, $page]
	});

	return \@results;
}

sub normalize :Private {
	my ($self, $c, $query) = @_;

	$query = lc($query);

	$query =~ s/^[\s]+//;
	$query =~ s/[\s]+$//;

	my @token = split /[\s]+/, $query;

	# TODO: have an Arabic linguist (Kais?) correct and improve this
	my @collapse = qw/wa fa bil lil lel lal al wal fal wabil walil walel walal falil falel falal/;
	my %collapse = map { $_ => 1 } @collapse;
	for (my $i = 0; $i < scalar @token - 1; $i++) {
		if ($collapse{$token[$i]}) {
			splice(@token, $i, 2, $token[$i] . $token[$i+1]);
			$i = -1;
		}
	}

	my %token = map { $_ => 1 } @token;
	   @token = keys %token;

	# TODO: have Arabic speakers or preferrably a linguist (Kais?) correct and improve this
	for (@token) { # collapse shams prefixes
		$_ =~ s/^alsh/ash/;
		$_ =~ s/^walsh/wash/;
		$_ =~ s/^falsh/fash/;
		$_ =~ s/^balsh/bash/;
		$_ =~ s/^alth/ath/;
		$_ =~ s/^walth/wath/;
		$_ =~ s/^falth/fath/;
		$_ =~ s/^balth/bath/;
		$_ =~ s/^als/ass/;
		$_ =~ s/^wals/wass/;
		$_ =~ s/^fals/fass/;
		$_ =~ s/^bals/bass/;
		$_ =~ s/^alr/arr/;
		$_ =~ s/^walr/warr/;
		$_ =~ s/^falr/farr/;
		$_ =~ s/^balr/barr/;
		$_ =~ s/^aln/ann/;
		$_ =~ s/^waln/wann/;
		$_ =~ s/^faln/fann/;
		$_ =~ s/^baln/bann/;
		$_ =~ s/^ald/add/;
		$_ =~ s/^wald/wadd/;
		$_ =~ s/^fald/fadd/;
		$_ =~ s/^bald/badd/;
		$_ =~ s/^alz/azz/;
		$_ =~ s/^walz/wazz/;
		$_ =~ s/^falz/fazz/;
		$_ =~ s/^balz/bazz/;
	}

	%token = map { $_ => 1 } @token;
	@token = sort keys %token;

	return @token;
}

__PACKAGE__->meta->make_immutable;

1;

