package Quran::System::Share::API;
use Moose;
use namespace::autoclean;

use Params::Coerce;
use Moose::Util::TypeConstraints;
use bytes;

has name => (
	is => 'rw',
	isa => 'Str',
);

has uri => (
	is => 'rw',
	isa => 'Str',
);

has id => (
	is => 'rw',
	isa => 'Str'
);

subtype 'COERCE::HTTP::Headers' => as class_type('HTTP::Headers');
 coerce 'COERCE::HTTP::Headers' => from 'ArrayRef' => via {
	new HTTP::Headers (
		map { $_->[0] => $_->[1] } @{ $_ }
	)
};

has 'headers' => (
	is => 'rw',
	isa => 'COERCE::HTTP::Headers',
	lazy => 1,
	coerce => 1,
	default => sub {},
	handles => [qw/header/]
);

has 'agent' => (
	is => 'rw',
	isa => 'LWP::UserAgent',
	required => 1
);

has 'auth' => (
	is => 'rw',
	isa => 'Quran::System::Share::Auth',
	required => 1
);

sub request {
	my $self = shift;
	my $params = (@_ == 1 and ref $_[0] eq "HASH") ? $_[0] : (@_ > 1 and @_ % 2 == 0) ? { @_ } : {};
	my ($request, $response, $content);

	$request = $self->_request( $params );

	#$params->{account}->queue->create({
	#	request => MIME::Base64::encode( Storable::nfreeze( $request ) )
	#});

	#return { queued => 1 };
	$response = $self->_response( $request );
	$content = $self->_content( $response );
	return { request => $request, response => $response, content => $content };
}

sub _request {
	my $self = shift;
	my %params = (@_ == 1 and ref $_[0] eq "HASH") ? %{ $_[0] } : %_;

	my $account = $params{account};
	my $method  = $params{method} || 'POST';
	my $uri     = $params{uri} || ( $self->uri . $params{resource} );
	my $headers = $self->headers->clone;
	my $content = $params{content};
	my $params  = $params{params};

	$headers->header( $_ => $params{headers}->{ $_ } ) for keys %{ $params{headers} };
	$headers->header( $self->auth->header($account, { method => $method, uri => $uri, params => $params }) );

	my $sending = ($method eq 'POST' or $method eq 'PUT');
	my $type = $headers->header('Content-Type');

	if (keys %{ $params }) {
		if ($sending and not $content) {
			if ($type =~ /^application\/json/ or $type =~ /^text\/javascript/) {
				$content = JSON::XS->new->utf8->encode($params)
			}
			elsif ($type =~ /^application\/x-www-form-urlencoded/) {
				$content = OAuth::Lite::Util::normalize_params($params);
			}
		}
		else {
			$uri = sprintf q{%s?%s}, $uri, OAuth::Lite::Util::normalize_params($params);
		}
	}

	$headers->header('Content-Length', bytes::length($content) || 0 );
	
	return new HTTP::Request ( $method, $uri, $headers, $content );
}

sub _response {
	my ($self, $request) = (shift, shift);

	return $self->agent->request( $request );
}

sub _content {
	my ($self, $response) = (shift, shift);
	my ($type, $encoded, $content);

	$type = $response->header('Content-Type');
	$encoded = $response->header('Content-Encoding');
	$content = ( $encoded and $encoded eq 'gzip' ) ? $response->decoded_content : $response->content;

	$content = JSON::XS->new->relaxed->utf8->decode( $content )
		if $type =~ /^application\/json/ or $type =~ /^text\/javascript/;

	return $content;
};

__PACKAGE__->meta->make_immutable;

1;
