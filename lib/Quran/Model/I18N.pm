package Quran::Model::I18N;

use base 'Catalyst::Component';

__PACKAGE__->config({
	language => {
		  default => 'en',
		installed => { array => [], hash => {} }
	},
	path => {
		independent => [ qw{sign account session profile i18n favicon.ico} ],
	},
	lexicon => {}
});

sub language {
	my ($self, $c) = (shift, shift);

	return $c->stash->{language}
		if not $_[0]
			and defined $c->stash->{language} and exists $c->stash->{language}->{language_code}
			and exists $self->{language}->{installed}->{hash}->{ $c->stash->{language}->{language_code} };

	my ($language_code) = @_;

	# retrieve from setting controller,
	# which retrieves from session and falls back on user setting from the db
	# failing that, fall back on extrapolated/derived language list from languages subroutine
	unless ($language_code and $self->{language}->{installed}->{hash}->{ $language_code }) {
		$language_code = $c->setting('language'); # retrieves from session or user
		unless ($language_code and $self->{language}->{installed}->{hash}->{ $language_code }) {
			for (@{ $self->languages($c) }) {
				if ($self->config->{language}->{installed}->{hash}->{ $_->{language_code} }) {
					$language_code = $_->{language_code};
					last;
				}
			}
			$language_code ||= $self->{language}->{default};
		}
	}

	$c->stash->{language} = $c->memcache->find("language:$language_code", {
		model => 'DB::I18N::Language',
		where => {
			language_code => $language_code
		}
	});

	return $c->stash->{language};
}

sub languages {
	my ($self, $c) = (shift, shift);

	return $c->stash->{languages}
		if not $_[0] and defined $c->stash->{languages};

	my ($language_codes) = @_;

	unless ($language_codes) {
		my @language_codes;
		if (my $accept = $c->request->header('Accept-Language')) {
			push @language_codes, $_ for split ',', $accept;
		}
		if (my $setting = $c->setting('languages')) {
			my @setting = split ',', $setting;
			push @language_codes, $_ for @setting;
		}
		$_ =~ s/[-;].*$// for @language_codes;
		push @language_codes, $self->{language}->{default};
		$language_codes = \@language_codes
	}

	my @language_codes;
	my %language_codes = map { $_ => 1 } @{ $language_codes };
	for (@{ $language_codes }) {
		if ($language_codes{ $_ }) {
			$language_codes{ $_ } = 0;
			push @language_codes, $_;
		}
	}

	$c->stash->{languages} = [];
	for my $language_code (@language_codes) {
		push @{ $c->stash->{languages} }, $c->memcache->find("language:$language_code", {
			model => 'DB::I18N::Language',
			where => {
				language_code => $language_code
			}
		});
	}

	# TODO: Consider saving in session/user setting:
	return $c->stash->{languages};
}

sub lexicon {
	my ($self, $c) = (shift, shift);
	my $language_code = ($c->stash->{language}->{language_code} or $self->language($c)->{language_code});
	my $lexicon;
	for my $key (keys %{ $self->{lexicon} }) {
		my ($message) = split /-----/, $key, 2;
		$lexicon->{ $key } = ( $self->{lexicon}->{ $key }->{ $language_code } or $message );
	}
	return $lexicon;
}

sub localize {
	my ($self, $c, $message, $params) = (shift, shift, shift, (shift or {}));
	my $language_code = ($c->stash->{language}->{language_code} or $self->language($c)->{language_code});

	my $context = ($params->{context}  or '');
	my $key = $message .'-----'. $context;

	my $result = $message;

	if (defined $self->{lexicon}->{ $key }) {
		$result = $self->{lexicon}->{ $key }->{ $language_code } if defined $self->{lexicon}->{ $key }->{ $language_code };
	}
	else {
		# insert into message
	}

	if (defined $params->{token}) {
		for my $key (keys %{ $params->{token} }) {
			my $value = $params->{token}->{ $key };
			   $value = '<var data-token="'. $key. '">'. $value .'</var>' unless $params->{attribute};
			  $result =~ s/{$key}/$value/g;
		}
	}

	$result = '<ins class="i18n" data-message="'. $message .'" data-context="'. $context .'">'. $result .'</ins>' unless $params->{attribute};
	return $result;

=cut
	$language_code = ($c->stash->{language}->{language_code} or $c->language->{language_code}) unless defined $language_code;

	return $c->i18n->{lexicon}->{$language_code}->{$message} if defined $c->i18n->{lexicon}->{$language_code}->{$message};
	$c->log->debug("going through localize routine for language $language_code message $message");

	my $set_value = sub {
		my $result = $c->model('DB::I18N::Lexicon')->find({
			language => $language_code,
			message => $message
		});
		if ($result) {
			$result->update({ value => $value });
		}
		else {
			$c->model('DB::I18N::Message')->find_or_create({
				key => $message
			});
			$c->model('DB::I18N::Lexicon')->find_or_create({
				language => $language_code,
				message => $message,
				value => $value
			});
		}
	};

	my $get_value = sub {
		my $where = {
			language => $language_code,
			message  => $message
		};
		my $attributes = { columns => ['value'] };

		if (my $result = $c->model('DB::I18N::Lexicon')->find($where, $attributes)) {
			$value = $result->get_column('value');
		}
		else { # fallback on default language and try to get message value
			$result = $c->model('DB::I18N::Message')->find_or_create({ key => $message });
			$value = $message;
		}

		$value;
	};

	if ($value) {
		$set_value->();
		return;
	}
	else {
		$c->model('DB::I18N::Message')->find_or_create({
			key => $message
		});

		$c->i18n->{lexicon}->{$language_code}->{$message} = $message;
		return $message;
	}
=cut
}

1;
