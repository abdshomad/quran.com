package Quran::Plugin::Config::Roles;

use Moose::Role;
use namespace::autoclean;

after setup_finalize => sub {
	my $c = shift;

	my @role = $c->model('DB::Account::Role')->search;

	$c->config->{roles} = { map { $_->get_column('name') => $_->get_column('role_id') } @role };
};

=head1 AUTHOR

Nour Sharabash <nour@quran.com>

=head1 LICENSE

Copyright (c) 2011 by Nour Sharabash.

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

1;
