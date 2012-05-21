package Quran::Controller::Share::Twitter;
use Moose;
use namespace::autoclean;

BEGIN {
	extends 'Catalyst::Controller::REST';
	   with 'Quran::System::Share';
}

sub comment {
	my ($self, $c, $account) = @_;
	my ($result);

	my $content;

	open $content, '</home/nour/Downloads/quran2.jpeg';
	binmode $content;

	$result = $self->api->request(
		account => $account,
		method => 'POST',
		resource => 'statuses/update.json',
		params => {
			# limit 140 chars
			status => 'user comment quran.com/2/255',
		},
	);

	close $content;

	return $result;
}

__PACKAGE__->meta->make_immutable;

1;
