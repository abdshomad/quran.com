package Quran::Plugin::I18N::Host;

use Moose::Role;
use namespace::autoclean;

after prepare_path => sub {
	my $c = shift;

	my $host = $c->request->uri->host;
	my $base = $c->request->base;
	my $path = $c->request->uri->path;

	my ($prefix) = split m{/}, $path, 2;
	return if $prefix and $prefix eq 'static';

	unless (ref($c->i18n->{path}->{independent}) eq 'Regexp') {
		my $re = join '|', map { qr{^$_$|^$_/.*$} } @{ $c->i18n->{path}->{independent} };
		$re = qr{$re};
		$c->i18n->{path}->{independent} = $re;
	}

	my ($sub, $domain) = split m{\.}, $host, 2;

	if ($sub and $domain and $domain eq 'quran.com' and exists $c->i18n->{language}->{installed}->{hash}->{ $sub }) {
		$c->i18n->language($c, $sub);
	}
	else {
		$c->i18n->language($c);
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
