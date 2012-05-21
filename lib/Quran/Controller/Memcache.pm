# بسم الله الرحمن الرحيم
# vim: ts=2 sw=2 noexpandtab

package Quran::Controller::Memcache;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller' }

sub get {
	my $self = shift;
	unless (defined $self->{cache}) {
		$self->{cache} = $self->{_application}->cache('memcache');
	}
	return $self->{cache}->get(@_);
}

sub multi {
	my $self = shift;
	unless (defined $self->{cache}) {
		$self->{cache} = $self->{_application}->cache('memcache');
	}
	return $self->{cache}->get_multi(@_);
}

sub set {
	my $self = shift;
	unless (defined $self->{cache}) {
		$self->{cache} = $self->{_application}->cache('memcache');
	}
	my ($key, $value) = @_;
	$self->{cache}->set($key, $value);
	return $value;
}

sub AUTOLOAD {
	my $self = shift;
	unless (defined $self->{cache}) {
		$self->{cache} = $self->{_application}->cache('memcache');
	}
	(my $method = $Quran::Controller::Memcache::AUTOLOAD) =~ s/^.*://;
	my %is_db = map { $_ => 1 } qw/find find_or_create search/;
	return $self->_from_db($method, @_) if $is_db{$method};
	return $self;
}

sub _from_db {
	my $self = shift;
	unless (defined $self->{cache}) {
		$self->{cache} = $self->{_application}->cache('memcache');
	}
	my ($method, $key, $hash) = @_;
	my ($model, $where, $attrs) = ($hash->{model}, $hash->{where}, $hash->{attrs});
	return unless $model;
	return unless $model = $self->{_application}->model($model);
	my $value;
	unless ($value = $self->get($key)) {
		if (my $set = $model->$method($where, $attrs)) {
			if ($set->can('next')) {
				while (my $result = $set->next) {
					my %row = map { $_ => $result->get_column($_) } keys %{ $result->{_column_data} };
					push @{ $value }, \%row;
				}
			}
			else {
				my $result = $set;
				my %row = map { $_ => $result->get_column($_) } keys %{ $result->{_column_data} };
				$value = \%row;
			}
		}
		$value ||= [];
		$self->set($key, $value);
	}
	return $value;
}

__PACKAGE__->meta->make_immutable;

1;
