package Quran::Controller::Search::Quran;
use Moose;
use namespace::autoclean;

use Encode::Arabic; Encode::Arabic::enmode 'Buckwalter', 'noneplus';

BEGIN { extends 'Catalyst::Controller' }

sub search :Private {
	my ($self, $c, $query, $page) = @_;
	#$c->log->debug('SEARCH FROM QURAN CALLED');

	my @token = $self->normalize($c, $query);

	$query = join ' ', @token;
	#$c->log->debug('QUERY '. $query);

	my @results = $c->model('DB::View::Search')->search(undef, {
		bind => ['quran', $query, $page]
	});

	return \@results;
}

sub normalize :Private {
	my ($self, $c, $query) = @_;

	$query =~ s/^[\s]+//;
	$query =~ s/[\s]+$//;

	my @token = split /[\s]+/, lc($query);
	my %token = map { $_ => 1 } @token;
	   @token = keys %token;

	for (@token) {
		#$_ = encode 'utf8', $_;

		$_ =~ s/\x{0623}/\x{0627}/g;         # collapse alef forms
		$_ =~ s/\x{0625}/\x{0627}/g;         # collapse alef forms
		$_ =~ s/\x{0648}\x{0670}/\x{0627}/g; # collapse "waw + alef above" to just "alef"
		$_ =~ s/\x{0670}/\x{0627}/g;         # synonymous structures for small-alef e.g. "AlSrT" and "AlSrAT"
		$_ =~ s/\x{0624}/W/g;                # 624 (waw + hamza above) needs to become safe because '&' breaks tsquery
		$_ =~ s/\x{0630}/X/g;                # 630 (thal) needs to become safe because '*' interferes with thesaurus dictionary

		$_ =~ s/\x{0640}//g; # strip tatweel
		$_ =~ s/\x{0653}//g; # strip maddah
		$_ =~ s/\x{0654}//g; # strip hamza above
		$_ =~ s/\x{06DC}//g; # strip small high seen
		$_ =~ s/\x{06DF}//g; # strip small high rounded zero
		$_ =~ s/\x{06E0}//g; # strip small high upright rectangular zero
		$_ =~ s/\x{06E2}//g; # strip small high meem isolated form
		$_ =~ s/\x{06E3}//g; # strip small low seen
		$_ =~ s/\x{06E5}//g; # strip small waw
		$_ =~ s/\x{06E6}//g; # strip small ya
		$_ =~ s/\x{06E8}//g; # strip small high noon
		$_ =~ s/\x{06EA}//g; # strip empty centre low stop
		$_ =~ s/\x{06EB}//g; # strip empty centre high stop
		$_ =~ s/\x{06EC}//g; # strip rounded high stop with filled centre
		$_ =~ s/\x{06ED}//g; # strip small low meem
		$_ = encode 'Buckwalter', $_;
		$_ =~ s/'/2/g; # because hamza encoded as ' breaks search in the database
	}

	%token = map { $_ => 1 } @token;
	@token = sort keys %token;

	my ($word_2_root, $word_2_lemma);

	unless ($word_2_root = $c->memcache('word:root')) {
		my @set = $c->model('DB::View::Word2Root')->search();
		$word_2_root = { map {
			$_->get_column('word') => $_->get_column('root')
		} @set };
		$c->memcache('word:root', $word_2_root);
	}

	unless ($word_2_lemma = $c->memcache('word:lemma')) {
		my @set = $c->model('DB::View::Word2Lemma')->search();
		$word_2_lemma = { map {
			$_->get_column('word') => $_->get_column('lemma')
		} @set };
		$c->memcache('word:lemma', $word_2_lemma);
	}

	for (@token) {
		my $token = $_;
		if (my $lemma = $word_2_lemma->{$_}) {
			$token .= '|'. $lemma .':B';
			#$c->log->debug("LEMMA $lemma FOUND FOR $_ -- TOKEN IS $token");
		}
		if (my $root = $word_2_root->{$_}) {
			$token .= '|'. $root .':C';
			#$c->log->debug("ROOT $root FOUND FOR $_ -- TOKEN IS $token");
		}
		$_ = $token;
	}

	return @token;
}

__PACKAGE__->meta->make_immutable;

1;
