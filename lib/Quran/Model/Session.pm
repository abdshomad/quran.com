package Quran::Model::Session;
use Moose;
use namespace::autoclean;

extends 'Catalyst::Model';

__PACKAGE__->config({
	valid => {
		content => {
			quran => sub {
				if (ref $_[1] eq 'HASH') {
					my ($words, $images, $text) = ($_[1]->{words}, $_[1]->{images}, $_[1]->{text});

					(defined $words and not defined $images and not defined $text) and $words eq 1 or
					(defined $images and not defined $words and not defined $text) and $images eq 1 or
					(defined $text and not defined $words and not defined $images) and defined $_[0]->{_valid}->{content}->{quran}->{text}->{ $text }
				}
			},
			resources => undef,
		},
		navMenu => {
			sortOrder => sub { $_[1] eq 'revelation' or $_[1] eq 'number' },
			textSize => {
				quran => sub { $_[1] >= 70 and $_[1] <= 400 },
				resources => sub { $_[1] >= 80 and $_[1] <= 300 },
			},
		}
	},
	default => {
		content => {
			quran => { words => 1 }
		}
	}
});

sub setup {
	my ($self, $c) = (shift, shift);
	my @set;
	
	@set = $c->model('DB::Content::Resource')->search({
		'me.type' => 'text'
	}, {
		columns => 'me.resource_code'
	});

	$self->{_valid}->{content}->{quran}->{text} = { map { $_->get_column('resource_code') => 1 } @set };

	@set = $c->model('DB::Content::Resource')->search({
		'me.language_code' => { '!=' => 'ar' }
	}, {
		columns => [qw/me.language_code me.type me.resource_code/]
	});

	$self->{valid}->{content}->{resources}->{ $_->get_column('language_code') }->{ $_->get_column('type') }->{ $_->get_column('resource_code') } = [\1, \0] for @set;
}

sub valid {
	my ($self, $params) = (shift, shift);
	my $base = (shift or $self->{valid});

	return 0 unless ref $params eq 'HASH';
	for (keys %{ $params }) {
		return 0 if $_ =~ /^_/;
		return 1 if ref $base eq 'HASH' and not defined $base->{ $_ };
		return 0 unless ref $base eq 'HASH' and defined $base->{ $_ };
		return 1 if ref $base->{ $_ } eq 'SCALAR' and ${ $base->{ $_ } } eq $params->{ $_ } or ref $base->{ $_ } eq 'CODE' and &{ $base->{ $_ } }( $self, $params->{ $_ } );
		if (ref $base->{ $_ } eq 'ARRAY') {
			my $key = $_;
			for (@{ $base->{ $key } }) {
				return 1 if ref $_ eq 'SCALAR' and ${ $_ } eq $params->{ $key } or ref $_ eq 'CODE' and &{ $_ }( $self, $params->{ $key } );
			}
		}
		return 0 unless ref $base->{ $_ } eq 'HASH' and ref $params->{ $_ } eq 'HASH';
		return $self->valid($params->{ $_ }, $base->{ $_ });
	}
}

sub extend {
	my ($self, $params, $base, $path) = (shift, shift, shift, shift);

	if (ref $params eq 'HASH') {
		for (keys %{ $params }) {
			push @{ $path }, $_;

			my $ref_valid = $self->{valid}; $ref_valid = (ref $ref_valid eq 'HASH' ? $ref_valid->{ $_ } : undef) for @{ $path };
			if ($ref_valid) {
				unless($self->valid($params->{ $_ }, $ref_valid)) {
					$base->{ $_ } = $params->{ $_ };
					return $base;
				}
			}

			$base->{ $_ } = $params->{ $_ } unless defined $base->{ $_ };
			$base->{ $_ } = $params->{ $_ } unless ref $base->{ $_ } eq 'HASH' and ref $params->{ $_ } eq 'HASH';
			$base->{ $_ } = $self->extend($params->{ $_ }, $base->{ $_ }, $path);
		}
	}
	else { $base = $params; }

	return $base;
}

sub default {
	my ($self, $c) = (shift, shift);
	my ($stash, $cache, $default, $language_code, $cache_key) = ($c->stash, $c->cache('memcache'));

	$language_code = $stash->{language}->{language_code};

	$default->{_version} = $Quran::VERSION;
	$default->{content}->{quran} = $self->{default}->{content}->{quran};

	if ($language_code ne 'ar') {
		$cache_key = "session:default:resources:$language_code";

		unless ($default->{content}->{resources}->{ $language_code } = $cache->get($cache_key)) {
			my @result = $c->model('DB::Content::Resource')->search({
				'me.type'          => ['translation', 'transliteration'],
				'me.language_code' => $language_code,
				'me.default'       => 1
			}, {
				columns => ['me.type', 'me.resource_code']
			});

			$default->{content}->{resources}->{ $language_code }->{ $_->get_column('type') }->{ $_->get_column('resource_code') } = 1 for @result;

			$cache->set($cache_key, $default->{content}->{resources}->{ $language_code });
		}
	}

	return $default;
}

__PACKAGE__->meta->make_immutable;

1;
