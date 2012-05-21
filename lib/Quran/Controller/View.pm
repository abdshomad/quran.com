package Quran::Controller::View;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub get :Private {
	my ($self, $c, $m) = (shift, shift, shift);
	my ($template, $token, $unique, $override) = @_;
	my ($cache, $cache_key, $output) = ($c->cache('view'), $template);

	for (keys %{ $unique }) {
		$cache_key .= ",$_=$unique->{ $_ }" if defined $unique->{ $_ };
	}

	if ($override->{debug} or (not $output = $cache->get($cache_key))) {
		$output = $m->scomp($template);
		$cache->set($cache_key, $output);
	}

	for (keys %{ $token }) {
		$token->{ $_ } = '' if not defined $token->{ $_ };
		$output =~ s/\${\s*$_\s*}/$token->{ $_ }/g;
	}

	return $output;
}


__PACKAGE__->meta->make_immutable;

1;
