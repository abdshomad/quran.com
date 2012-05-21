package Quran::View::Mason;

use strict;
use warnings;

use parent 'Catalyst::View::Mason';

__PACKAGE__->config({
	use_match => 0,
	template_extension => '.mhtml',
	autohandler_name => 'autohandler.mhtml',
	allow_globals => [qw/$view $stash $session $request $params $lang $dir $class/],
	data_dir => '/tmp/quran/mason'
});

sub render {
	my $self = shift;
	my ($c, @args) = @_;
	my ($stash) = ($c->stash);

	if ($stash->{json}) {
		use JSON::XS;
		my $coder = JSON::XS->new->allow_nonref;
		$stash->{json} = $coder->encode($stash->{json});
	}

	$self->next::method(@_);
	#my $output = $self->next::method(@_);
	#$output =~ s/>\s+</></g;
	#$output;
}

1;
