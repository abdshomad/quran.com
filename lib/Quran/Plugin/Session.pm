package Quran::Plugin::Session;

use Moose::Role;
use namespace::autoclean;

after setup_finalize => sub {
	my $c = shift;

	$c->model('Session')->setup($c);
};

before session => sub {
	my $c = shift;
	my $browser = $c->request->browser;
	if ($browser->robot or $browser->curl or not defined $browser->user_agent or $browser->user_agent =~ /^ApacheBench/) {
		my $_session = { _robot => 1 };
		$c->_session($_session) unless defined $c->{_session};
	}
};

around store_session_data => sub {
	my $method = shift;
	my $c = shift;
	my $browser = $c->request->browser;
	unless ($browser->robot or $browser->curl or not defined $browser->user_agent or $browser->user_agent =~ /^ApacheBench/) {
		$c->$method(@_);
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
