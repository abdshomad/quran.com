package Quran::Controller::Fonts;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

=head1 NAME

Quran::Controller::Fonts - Catalyst Controller

=head1 DESCRIPTION

The purpose of this controller is to internally return css output for Quran
Complex fonts to other controller, e.g. Main or Search. This is necessary
for IE support because IE stupidly downloads all eot font files immediately
as soon as it encounters the css rule. If this was not the case, we could 
just put all the css rules in a single file for each of the 604 pages and
include it statically.

=head1 METHODS

=cut

=head2 css

Takes a list (@array) of pages and returns the raw CSS to be used inline
within a <style> declaration. CSS output varies based on client request's
user-agent.

@font-face {
	font-family: 'p$n';
	src: url('http://$cdn/p$n.eot?#iefix') format('embedded-opentype'), 
	     url('http://$cdn/p$n.woff')       format('woff'),
	     url('/static/fonts/p$n.ttf')      format('truetype'),
	     url('http://$cdn/p$n.svgz#p$n')   format('svg'),
	     url('/static/fonts/p$n.svg#p$n')  format('svg');
	font-weight: normal;
	font-style: normal;
}
.p$n {
	font-family: 'p$n';
}
=cut

sub for_pages :Private {
	my ($self, $c, $pages) = (shift, shift, shift);
	my ($local, $cdn, $browser) = (0, 'c216429.r29.cf1.rackcdn.com', $c->request->browser);
	my ($engine, $css) = ($browser->engine_string);

	if (defined $engine and ($engine eq 'Gecko' or $engine eq 'MSIE')) {
		$local = 1;
	}

	if ($local) {
		for my $n (@{ $pages }) {
			push @{ $css }, <<END
\@font-face {
	font-family: 'p$n';
	src: url('/static/fonts/compressed/eot/p$n.eot');
	src: url('/static/fonts/compressed/eot/p$n.eot?#iefix') format('embedded-opentype'), url('/static/fonts/woff/p$n.woff') format('woff'), url('/static/fonts/compressed/ttf/p$n.ttf') format('truetype'), url('/static/fonts/compressed/svg/p$n.svg#p$n') format('svg');
}
.p$n {
	font-family: 'p$n';
}
END
			;
		}
	}
	else {
		for my $n (@{ $pages }) {
			push @{ $css }, <<END
\@font-face {
	font-family: 'p$n';
	src: url('http://$cdn/p$n.eot?#iefix') format('embedded-opentype'),
	     url('http://$cdn/p$n.woff')       format('woff'),
	     url('http://$cdn/p$n.ttf')        format('truetype'),
	     url('http://$cdn/p$n.svg#p$n')    format('svg');
}
.p$n {
	font-family: 'p$n';
}
END
			;
		}
	}

	$css = join "\n", @{ $css };

	return {
		  css => $css,
		pages => $pages
	};
}

sub from_keys :Private {
	my ($self, $c, $keys, $pages) = (shift, shift, shift);

	$pages = $c->controller('Page')->from_keys($c, $keys);

	return $self->for_pages($c, $pages);
}

=head1 AUTHOR

Nour Sharabash <nour@quran.com>

=cut

__PACKAGE__->meta->make_immutable;

1;
