package Quran::Plugin::I18N;

use strict;
use warnings;

use MRO::Compat;
use base qw/
	Class::Data::Inheritable/;

__PACKAGE__->mk_classdata('i18n');

sub setup_finalize {
	my $c = shift;
	$c->next::method(@_);
	$c->i18n($c->component('Quran::Model::I18N'));
}

=head1 AUTHOR

Nour Sharabash <nour@quran.com>

=head1 LICENSE

Copyright (c) 2011 by Nour Sharabash.

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

1;
