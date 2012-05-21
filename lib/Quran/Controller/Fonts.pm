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

sub css :Private {
	my ($self, $c, $pages) = (shift, shift, shift);
	my ($local, $cdn, $browser) = (0, 'c216429.r29.cf1.rackcdn.com', $c->request->browser);
	my ($engine, $css) = ($browser->engine_string);

	$local = 1;
=cut
	if (defined $engine and ($engine eq 'Gecko' or $engine eq 'MSIE')) {
		$local = 1;
	}

=cut

	if ($local) {
		for my $n (@{ $pages }) {
			push @{ $css }, <<END
\@font-face {
	font-family: p$n;
	font-style: normal;
	font-weight: normal;
	src: url('http://quran.com/static/fonts/compressed/eot/p$n.eot');
	src: url('http://quran.com/static/fonts/compressed/eot/p$n.eot?#iefix') format('embedded-opentype'),
	     url('http://quran.com/static/fonts/woff/p$n.woff') format('woff'),
	     url('http://quran.com/static/fonts/compressed/ttf/p$n.ttf') format('truetype'),
	     url('http://quran.com/static/fonts/compressed/svg/p$n.svg#p$n') format('svg');
}
.p$n {
	font-family: p$n;
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

	# TODO: code below is a quick hack, needs proper refactor
	my $hash;
	for (my $i = 0; $i < scalar @{ $pages }; $i++) {
		my $n = $pages->[$i];
		my $id = "p$n";
		my $o = $css->[$i];
		$css->[$i] = ( join "\n", map { $_ =~ s/\s+/ /g; $_ =~ s/^\s+//; $_ =~ s/\s+$//; $_ } ( $css->[$i] ) );
		$hash->{ $id } = $css->[$i];
	}
	return $hash;

	#$css = '<style type="text/css" scoped="scoped">'. ( join "\n", map { $_ =~ s/\s+/ /g; $_ =~ s/^\s+//; $_ =~ s/\s+$//; $_ } @{ $css } ) .'</style>';

	#return $css;
}

=head1 AUTHOR

Nour Sharabash <nour@quran.com>

=cut

__PACKAGE__->meta->make_immutable;

1;
