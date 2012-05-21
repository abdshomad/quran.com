package Quran::Controller::Setting;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

my $c;

sub _ref {
	my $self = shift;
	$c = $_[0];
	return $self;
}

sub set {
	my $self = shift;
	my ($key, $value) = @_;
	if ((not defined $c->session->{$key} or $c->session->{$key} ne $value)
			and $c->can('user') and $c->user_exists) { # prevent unnecessary database CRUD
		$c->user->setting->update_or_create({
			key   => $key,
			value => $value
		}, { key => 'primary' });
	}
	$c->session->{$key} = $value;
	return $value;
}

sub get {
	my $self = shift;
	my ($key) = @_;
	my $value = $c->session->{$key};
	if (not defined $value and $c->can('user') # is this necessary?
			and $c->user_exists
			and my $result = $c->user->setting->find({ key => $key })) {
		$value = $result->get_column('value');
		$c->session->{$key} = $value; # prevent it from looking up from the database twice
	}
	return $value;
}

__PACKAGE__->meta->make_immutable;

1;

