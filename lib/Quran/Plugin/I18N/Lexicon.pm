package Quran::Plugin::I18N::Lexicon;

use Moose::Role;
use namespace::autoclean;

after setup_finalize => sub {
	my $c = shift;

	my @message = $c->model('DB::I18N::Message')->search;
	$c->i18n->{lexicon} = { map { $_->get_column('value') .'-----'. $_->get_column('context') => {} } @message };

	my @lexicon = $c->model('DB::I18N::Lexicon')->search({
	}, {
		join => [qw/message translation/],
		columns => [
			{ language_code => 'me.language_code'  },
			{       message => 'message.value'     },
			{       context => 'message.context'   },
			{   translation => 'translation.value' },
		]
	});
	$c->i18n->{lexicon}->{ $_->get_column('message') .'-----'. $_->get_column('context') }->{ $_->get_column('language_code') } = $_->get_column('translation') for @lexicon;
};

=head1 AUTHOR

Nour Sharabash <nour@quran.com>

=head1 LICENSE

Copyright (c) 2011 by Nour Sharabash.

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

1;
