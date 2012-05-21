package Quran::Controller::Session::Content;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Catalyst::Controller::REST' }

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
			my $resources;

			for my $type (keys %{ $content->{resources}->{ $language_code } }) {
				for my $resource_code (keys %{ $content->{resources}->{ $language_code }->{ $type } }) {
					if ($content->{resources}->{ $language_code }->{ $type }->{ $resource_code } and not $cached->{resources}->{ $language_code }->{ $type }->{ $resource_code }) {
						push @{ $resources }, { language_code => $language_code, type => $type, resource_code => $resource_code };
						$cached->{resources}->{ $language_code }->{ $type }->{ $resource_code } = 1;
					}
				}
			}

			if ($resources = $c->model('Content')->resources($c, $resources, $keys)) {
				$result->{content}->{resources} = $resources;
			}

			if ($content->{quran}->{text} and not $cached->{quran}->{text}->{ $content->{quran}->{text} }) {
				$result->{content}->{quran} = $c->model('Content')->text($c, $content->{quran}->{text}, $keys);
				$cached->{quran}->{text}->{ $content->{quran}->{text} } = 1;
			}
			elsif ($content->{quran}->{words} and not $cached->{quran}->{words}) {
				$result->{content}->{quran} = $c->model('Content')->words($c, $language_code, $keys);
				$cached->{quran}->{words} = 1;
			}
			elsif ($content->{quran}->{images} and not $cached->{quran}->{images}) {
				$result->{content}->{quran} = $c->model('Content')->images($c, $keys);
				$cached->{quran}->{images} = 1;
			}

			$result->{cached} = $cached;
		}
	}

	$self->status_ok($c, entity => $result);
}

__PACKAGE__->meta->make_immutable;

1;
