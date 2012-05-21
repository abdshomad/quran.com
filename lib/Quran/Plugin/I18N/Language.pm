package Quran::Plugin::I18N::Language;

use Moose::Role;
use namespace::autoclean;

after setup_finalize => sub {
	my $c = shift;

	# increase limit as community size increases, control which languages get included by setting priority column in the database
	my $limit = 99;
	my @set = $c->model('DB::I18N::Language')->search({
		'resource.language_code' => { '!=' => undef },
	}, {
		join => 'resource',
		columns => [
			{ language_code => 'me.language_code' },
			{       unicode => 'me.unicode'       },
			{       english => 'me.english'       },
			{      priority => 'me.priority'      },
			{          beta => 'me.beta'          },
		],
		order_by => [
			{ -asc => 'me.beta'     },
			{ -asc => 'me.priority' },
			{ -asc => 'me.english'  },
		],
		distinct => 1,
		rows => $limit
	});

	$c->i18n->config->{language}->{installed}->{hash} = { map { $_->get_column('language_code') => {
		unicode => $_->get_column('unicode'),
		english => $_->get_column('english'),
		   beta => $_->get_column('beta')
	} } @set };

	$c->i18n->config->{language}->{installed}->{array} = [ map { $_->get_column('language_code') } @set ];

};

=head1 AUTHOR

Nour Sharabash <nour@quran.com>

=head1 LICENSE

Copyright (c) 2011 by Nour Sharabash.

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

1;
