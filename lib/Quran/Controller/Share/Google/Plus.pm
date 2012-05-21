package Quran::Controller::Share::Google::Plus;
use Moose;
use namespace::autoclean;

BEGIN {
	extends 'Catalyst::Controller::REST';
	   with 'Quran::System::Share';
}

__PACKAGE__->meta->make_immutable;

1;
