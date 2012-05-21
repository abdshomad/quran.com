package Quran::View::Mason;

use strict;
use warnings;

use parent 'Catalyst::View::Mason';

__PACKAGE__->config({
	use_match => 0,
	template_extension => '.mhtml',
	autohandler_name => 'autohandler.mhtml',
	allow_globals => [qw/$view $stash $session $request $params/],
	data_dir => '/tmp/quran/mason'
});

sub render {
	my $self = shift;
	my ($c, @args) = @_;
	if ($c->stash->{json}) {
		use JSON::XS;
		my $coder = JSON::XS->new->allow_nonref;
		$c->stash->{json} = $coder->encode($c->stash->{json});
	}
	$self->next::method(@_);
}

1;
