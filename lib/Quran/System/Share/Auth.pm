package Quran::System::Share::Auth;
use Moose;
use namespace::autoclean;

use OAuth::Lite::Util;
use OAuth::Lite::Token;
use Storable;
use MIME::Base64;

has key => (
	is => 'rw',
	isa => 'Str',
);

has secret => (
	is => 'rw',
	isa => 'Str',
);

has realm => (
	is => 'rw',
	isa => 'Maybe[Str]',
);

has uri_request => (
	is => 'rw',
	isa => 'Maybe[Str]',
);

has uri_authorize => (
	is => 'rw',
	isa => 'Str',
);

has uri_access => (
	is => 'rw',
	isa => 'Str',
);

has uri_return => (
	is => 'rw',
	isa => 'Str',
);

has version => (
	is => 'rw',
	isa => 'Int',
);

has scope => (
	is => 'rw',
	isa => 'Maybe[Str]',
);

has 'agent' => (
	is => 'rw',
	isa => 'LWP::UserAgent',
	required => 1
);

with 'Quran::System::Share::Auth::Client';

sub header {
	my ($self, $account, $params) = (shift, shift, shift);
	my ($header);

	unless ($self->version == 1) {
		$header = sprintf(q{OAuth %s}, $account->token_access);
	}
	else {
		$header = $self->client->gen_auth_header($params->{method}, $params->{uri}, {
			realm => $self->realm,
			token => OAuth::Lite::Token->new( # TODO: factor this out with params coerce? seems silly
				token => $account->token_access,
				secret => $account->token_secret,
			),
			extra => $params->{params}
		});
	}

	return ( Authorization => $header );
}

sub refresh {
	my ($self, $account) = (shift, shift);
	my ($token, $request, $response);

	unless ($self->version == 1) {
		$token = $self->client->refresh_access_token( refresh_token => $account->token_refresh );
		$request = $self->client->last_request;
		$response = $self->client->last_response;
	}

	if ($token and $response->code == 200) {
		$account = $self->update($account, $token);
	}

	return { account => $account, token => $token, request => $request, response => $response };
}

sub redirect {
	my ($self, $session) = (shift, shift, shift);
	my ($token, $request, $response, $uri);

	unless ($self->version == 1) {
		$uri = $self->client->uri_to_redirect(
			redirect_uri => $self->uri_return,
			scope => $self->scope
		);
	}
	else {
		$token = $self->client->get_request_token; # TODO exception handling here
		$request = $self->client->oauth_request;
		$response = $self->client->oauth_response;

		if ($token and $response->code == 200) {
			$session->{_token} = MIME::Base64::encode(Storable::nfreeze($token));
			$uri = $self->client->url_to_authorize(
				token => $token
			);
		}
	}

	return { uri => $uri, token => $token, request => $request, response => $response };
}

sub return {
	my ($self, $params, $account, $session) = (shift, shift, shift, shift);
	my ($token, $request, $response);

	unless ($self->version == 1) {
		$token = $self->client->get_access_token(
			redirect_uri => $self->uri_return,
			code => $params->{code}
		);
		$request = $self->client->last_request; # TODO: abstractify in Client class
		$response = $self->client->last_response;
	}
	else {
		$token = delete $session->{_token};

		if ($token) {
			$token = Storable::thaw(MIME::Base64::decode( $token ));
			$token = $self->client->get_access_token(
				token => $token,
				verifier => $params->{oauth_verifier}
			);
			$request = $self->client->oauth_request;
			$response = $self->client->oauth_response;
		}
	}

	if ($token and $response->code == 200) {
		$account = $self->update($account, $token);
	}

	return { account => $account, token => $token, request => $request, response => $response };
}

sub update {
	my ($self, $account, $token) = (shift, shift, shift);
	my ($result);

	$result->{token_access}   = ($token->{access_token} or $token->{token});
	$result->{token_secret}   = $token->{secret};
	$result->{token_refresh}  = $token->{refresh_token};
	$result->{token_expires}  = ($token->{expires_in} or $token->{expires});
	$result->{token_expires} += time
		if $result->{token_expires};

	delete $result->{ $_ } for grep { not defined $result->{ $_ } } keys %{ $result };

	$account->update($result);

	return $result;
}

__PACKAGE__->meta->make_immutable;

1;
