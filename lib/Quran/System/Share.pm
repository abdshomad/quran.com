package Quran::System::Share;
use Moose::Role;
use namespace::autoclean;

use Quran::System::Share::Auth;
use Quran::System::Share::API;

with 'Quran::System::Share::Agent';

has auth => (
	is => 'rw',
	isa => 'Quran::System::Share::Auth',
	lazy => 1,
	default => sub {
		my $self = shift;

		return new Quran::System::Share::Auth (
			%{ $self->config->{_auth} },
			agent => $self->agent
		);
	}
);

has api => (
	is => 'rw',
	isa => 'Quran::System::Share::API',
	lazy => 1,
	default => sub {
		my $self = shift;

		return new Quran::System::Share::API (
			%{ $self->config->{_api} },
			agent => $self->agent,
			auth => $self->auth
		);
	}
);

after BUILD => sub {
	my ($self, $config) = (shift, shift);

	$self->config({ map { $_ => $config->{ $_ } } grep { $_ ne 'catalyst_component_name' } keys %{ $config } });
};

1;
