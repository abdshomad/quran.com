package Quran::Plugin::I18N::Path;

use Moose::Role;
use namespace::autoclean;

after prepare_path => sub {
	my $c = shift;

	my $path = $c->request->path;
	my $base = $c->request->base;
	my $orig = $c->request->uri->path;

	my ($prefix) = split qr{/}, $path, 2;
	return if $prefix and $prefix eq 'static';

	unless (ref($c->i18n->{path}->{independent}) eq 'Regexp') {
		my $re = join '|', map { qr{^$_$|^$_/.*$} } @{ $c->i18n->{path}->{independent} };
		$re = qr{$re};
		$c->i18n->{path}->{independent} = $re;
	}

	unless ($path and $path =~ $c->i18n->{path}->{independent}) {

		my ($language_code, $path) = split m{/}, $path, 2;
		$language_code = lc $language_code if defined $language_code;

		if ($language_code and exists $c->i18n->{language}->{installed}->{hash}->{ $language_code }) {
			$c->request->path($path);
			$base->path($base->path . $language_code .'/');
			$c->i18n->language($c, $language_code);
			$c->request->uri(URI->new($base . $c->request->path));
		}
		else {
			my $language_code = $c->i18n->language($c)->{language_code};
			$c->request->uri->path($language_code .'/'. $c->request->path);
			$base->path($base->path . $language_code .'/');
		}

		if ($orig ne $c->request->uri->path) {
			(my $query_string = $c->request->uri) =~ s{^[^?]+}{};
			$c->response->redirect($c->request->uri->path . $query_string);
		}
	}
};

=head1 AUTHOR

Nour Sharabash <nour@quran.com>

=head1 LICENSE

Copyright (c) 2011 by Nour Sharabash.

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

1;
