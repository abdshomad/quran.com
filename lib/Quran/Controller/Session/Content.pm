package Quran::Controller::Session::Content;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

__PACKAGE__->config(
	default => 'text/javascript',
	map => {
		'text/javascript' => 'JSON'
	}
);

sub base :Chained('/session/base') :PathPart('content') :CaptureArgs(0) {
	my ($self, $c) = (shift, shift);
}

sub content :Chained('base') :PathPart('') :Args(0) :ActionClass('REST') {}

sub content_POST {
	my ($self, $c) = (shift, shift);
	my ($params, $stash) = ($c->request->data, $c->stash);
	my ($result) = ($stash->{session});

	if ($result->{saved}) {
		my ($content, $cached, $keys, $language_code) = ($params->{session}->{content}, $params->{cached}, $params->{keys}, $params->{language_code});

		if (defined $content and ref $content eq 'HASH' and defined $cached and ref $cached eq'HASH' and defined $keys and ref $keys eq 'ARRAY' and defined $language_code) {
			for my $key (@{ $keys }) {
				for my $type (keys %{ $content->{resources}->{ $language_code } }) {
					for my $resource_code (keys %{ $content->{resources}->{ $language_code }->{ $type } }) {
						if ($content->{resources}->{ $language_code }->{ $type }->{ $resource_code } and not $cached->{ $key }->{resources}->{ $language_code }->{ $type }->{ $resource_code }) {
							push @{ $result->{content}->{resources}->{ $key } }, { language_code => $language_code, type => $type, resource_code => $resource_code };
							$cached->{ $key }->{resources}->{ $language_code }->{ $type }->{ $resource_code } = 1;
						}
					}
				}

				if ($content->{quran}->{text} and not $cached->{ $key }->{quran}->{text}->{ $content->{quran}->{text} }) {
					$result->{content}->{quran}->{ $key } = 'text';
					$cached->{ $key }->{quran}->{text}->{ $content->{quran}->{text} } = 1;
				}
				elsif ($content->{quran}->{words} and not $cached->{ $key }->{quran}->{words}) {
					$result->{content}->{quran}->{ $key } = 'words';
					$cached->{ $key }->{quran}->{words} = 1;
				}
				elsif ($content->{quran}->{images} and not $cached->{ $key }->{quran}->{images}) {
					$result->{content}->{quran}->{ $key } = 'images';
					$cached->{ $key }->{quran}->{images} = 1;
				}
			}

			for my $key (keys %{ $result->{content}->{resources} }) {
				$result->{content}->{resources}->{ $key } = $c->model('Content')->resources($c, $result->{content}->{resources}->{ $key }, [ $key ])->{ $key };
			}

			for my $key (keys %{ $result->{content}->{quran} }) {
				my $quran = $result->{content}->{quran}->{ $key };
				my @argument = $quran eq 'text' ? $content->{quran}->{text} : $quran eq 'words' ? $language_code : ();
				$result->{content}->{quran}->{ $key } = $c->model('Content')->$quran($c, @argument, [ $key ])->{ $key };
			}

			$result->{cached} = $cached;
		}
	}

	$self->status_ok($c, entity => $result);
}

__PACKAGE__->meta->make_immutable;

1;
