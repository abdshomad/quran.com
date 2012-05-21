package Quran::System::Share::Agent;
use Moose::Role;
use namespace::autoclean;

use LWP::UserAgent;

has 'agent' => (
	is => 'ro',
	isa => 'LWP::UserAgent',
	required => 1,
	lazy => 1,
	default => sub { new LWP::UserAgent ( agent => 'quran.com social network agent v.1' ) }
);

1;
