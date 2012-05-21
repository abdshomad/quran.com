package Quran::Controller::Search;
use Moose;
use namespace::autoclean;
use List::Util qw/min/;

# TODO:
# - neural network feedback and ranking i.e. "learn from clicks"
# - results by concept
# - query completion/suggestion system
# - query correction system e.g. "did you mean ____ ?"
# - Search::Tafsir
# - port schema to corpus4 and refactor

BEGIN { extends 'Catalyst::Controller' }

sub base :Chained('/base') :PathPart('search') :CaptureArgs(0) {
	my ($self, $c) = @_;

	$c->controller('Main')->base($c);

	unless (defined $self->{valid}) {
		$self->{valid} = {
			type => sub {
				my $type = shift;
				return $type eq 'quran' or $type eq 'translation' or $type eq 'transliteration';
			}
		};
	}

	$c->stash(
		template => 'screen/search/view.mhtml',
		    view => 'search'
	);
}

sub view :Chained('base') :PathPart('') :Args(0) {
	my ($self, $c) = @_;
	my ($stash, $session, $params) = ($c->stash, $c->session, $c->request->params);
	my ($language_code, $limit, $query, $type, $page) = ($stash->{language}->{language_code}, $params->{l}, $params->{q}, $params->{t}, $params->{p});
	my ($original_type, $controller, $results, $more_results, $keys, $content);

	$limit ||= 12;
	$page  ||= 1;
	$type  ||= 'auto';
	
	$limit = 12 unless $limit =~ /^\d+$/ and $limit > 0;
	$page = 1 unless $page =~ /^\d+$/ and $page > 0;
	$type = 'auto' unless $type eq 'quran' or $type eq 'translation' or $type eq 'transliteration';
	$query =~ s/^[\s\p{PosixPunct}]+(.*)[\s\p{PosixPunct}]+$/$1/;
	$original_type = $type;

	return unless $query;

	if ($type eq 'auto') {
		if ($query =~ /\p{Arabic}+/) {
			$type = 'quran';
		}
		else {
			$type = 'translation';
		}
	}
	elsif ($type eq 'quran') {
		unless ($query =~ /\p{Arabic}+/) {
			if ($query =~ /^\p{ASCII}+$/) {
				$type = 'transliteration';
			}
			else {
				$type = 'translation';
			}
		}
	}
	if ($type eq 'quran') {
		$query =~ s/\p{ASCII}+/ /g;
	}

	($controller = $type) =~ s/^(.)/uc($1)/e;

	$controller = $c->controller('Search::'. $controller);

	return unless $controller;

	$results = $controller->search($c, $query, $page);

	if ($original_type eq 'auto' and scalar @{ $results } < $limit and $query =~ /^\p{ASCII}+$/) {
		$more_results = $c->controller('Search::Transliteration')->search($c, $query, 1);
		if (scalar @{ $more_results }) {
			for (my $i = 0; $i < min scalar @{ $more_results }, $limit - scalar @{ $results }; $i++) {
				push @{ $results }, $more_results->[$i];
			}
		}
	}

	return unless scalar @{ $results };

	$keys = [ map { $_->get_column('key') } @{ $results } ];


	# quick hack
	$stash->{page}->{first} = $keys->[0];
	$stash->{page}->{last} = $keys->[scalar @{ $keys } - 1];

	$c->controller('Main')->stash_session_content($c, $keys);

	$stash->{l} = $limit;
	$stash->{p} = $page;
	$stash->{t} = $original_type;
	$stash->{q} = $query;
	$stash->{query} = $query;
	$stash->{json}->{query} = $stash->{query};

	$stash->{json}->{view} = $stash->{view};
	$stash->{json}->{modules} = '*.*';
}

__PACKAGE__->meta->make_immutable;

1;
