package Quran::System::Share::Auth::Client;
use Moose::Role;
use namespace::autoclean;

use OAuth::Lite2::Client::WebServer;
use OAuth::Lite::Consumer;

use Moose::Util::TypeConstraints;
use Params::Coerce;

requires 'agent';

subtype 'COERCE::Quran::System::Share::Auth::Client::V1' => as class_type('OAuth::Lite::Consumer');
subtype 'COERCE::Quran::System::Share::Auth::Client::V2' => as class_type('OAuth::Lite2::Client::WebServer');
subtype 'COERCE::Quran::System::Share::Auth::Client' => as 'COERCE::Quran::System::Share::Auth::Client::V1|COERCE::Quran::System::Share::Auth::Client::V2';
 coerce 'COERCE::Quran::System::Share::Auth::Client' => from 'Quran::System::Share::Auth::Client' => via {
	my $self = shift;

	if ($self->version == 1) {
		return new OAuth::Lite::Consumer (
			consumer_key => $self->key,
			consumer_secret => $self->secret,
			request_token_path => $self->uri_request,
			authorize_path => $self->uri_authorize,
			access_token_path => $self->uri_access,
			callback_url => $self->uri_return,
			realm => $self->realm,
			ua => $self->agent,
		);
	}
	else {
		return new OAuth::Lite2::Client::WebServer (
			id => $self->key,
			secret => $self->secret,
			authorize_uri => $self->uri_authorize,
			access_token_uri => $self->uri_access,
			agent => $self->agent
		);
	}
};

has client => (
	is => 'ro',
	isa => 'COERCE::Quran::System::Share::Auth::Client',
	lazy => 1,
	coerce => 1,
	default => sub { shift }
);

1;
